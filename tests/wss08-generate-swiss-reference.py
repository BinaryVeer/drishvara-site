#!/usr/bin/env python3
"""WSS08 isolated CI-only, independent ephemeris cross-check.

The reference tool pyswisseph is AGPL (Astrodienst Swiss Ephemeris licensing).
Used solely as a standalone ephemeral verification process. NEVER bundle this
Python file, the library, or generated personal charts in the public site.

pip install pyswisseph==2.10.3.2  (CI-only)
Reference results generated with Moshier algorithm, no DE data files.
No user birth data is used: all moments/locations are synthetic.
"""
from datetime import datetime, timedelta, timezone
from pathlib import Path
import json
import random
import swisseph as swe

SEED = 20261105
COUNT = 160
ROOT = Path("wss08-qa")
ROOT.mkdir(exist_ok=True, parents=True)
swe.set_sid_mode(swe.SIDM_LAHIRI)
BODIES = [
    ("Sun", swe.SUN), ("Moon", swe.MOON), ("Mercury", swe.MERCURY),
    ("Venus", swe.VENUS), ("Mars", swe.MARS), ("Jupiter", swe.JUPITER),
    ("Saturn", swe.SATURN), ("Rahu", swe.MEAN_NODE),
]
FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
sample = random.Random(SEED)
UTC = timezone.utc
cases = []
anchors = [
    (datetime(1900, 1, 1, 0, 38, 50, tzinfo=UTC), 22.6, 88.3),
    (datetime(2000, 1, 1, 12, 0, 0, tzinfo=UTC), 0, 0),
    (datetime(2026, 11, 5, 4, 35, 23, tzinfo=UTC), 27.08, 93.60),
    (datetime(2050, 7, 1, 14, 0, tzinfo=UTC), 40.7, -74.0),
    (datetime(2026, 10, 25, 0, 30, 0, tzinfo=UTC), 51.5, -0.12),
    (datetime(2026, 10, 25, 1, 30, 0, tzinfo=UTC), 51.5, -0.12),
]
for i in range(COUNT):
    if i < len(anchors):
        when, lat, lon = anchors[i]
    else:
        # Strictly inside 1900–2100; independent seeded dates include leap years.
        days = sample.randrange(365 * 200)
        seconds = sample.randrange(86400)
        when = datetime(1900, 1, 1, tzinfo=UTC) + timedelta(
            days=days, seconds=seconds)
        lat = round(sample.uniform(-60.0, 60.0), 6)
        lon = round(sample.uniform(-179.0, 179.0), 6)
    hour = when.hour + when.minute / 60.0 + when.second / 3600.0
    jd = swe.julday(when.year, when.month, when.day, hour, swe.GREG_CAL)
    grahas = {}
    for name, body in BODIES:
        (values, actual_flag) = swe.calc_ut(jd, body, FLAGS)
        if not (actual_flag & swe.FLG_MOSEPH):
            raise RuntimeError("Moshier reference engine unexpectedly changed")
        grahas[name] = round(values[0] % 360, 10)
    cusps, angles = swe.houses_ex(jd, lat, lon, b"P", swe.FLG_SIDEREAL)
    cases.append({
        "utc": when.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "latitude": lat, "longitude": lon,
        "grahas": grahas,
        "lagna_sidereal_degrees": round(angles[0] % 360, 10),
        "ayanamsha_degrees": round(swe.get_ayanamsa_ut(jd) % 360, 10)
    })
output = {
    "id": "WSS08_SWISS_MOSHIER_SEEDED_SYNTHETIC_V1",
    "seed": SEED, "count": COUNT,
    "reference_engine": "Swiss Ephemeris 2.10.03 via pyswisseph 2.10.3.2",
    "reference_formula": "Moshier|Sidereal Lahiri|mean node|Placidus house ASC",
    "legal": "CI-only separate AGPL executable; no Swiss source or binaries shipped in product",
    "synthetic_only": True,
    "fixtures": cases
}
path = ROOT / "synthetic_swiss_reference.json"
path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"WSS08 Swiss independent fixture generation: {len(cases)} synthetic cases at {path}")
