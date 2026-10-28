import json,gzip,datetime,zoneinfo,swisseph as swe,statistics,argparse
parser=argparse.ArgumentParser();parser.add_argument("--payload",default="data/location-releases/city-restoration-20261028.json.gz");parser.add_argument("--results",required=True);parser.add_argument("--output",required=True);args=parser.parse_args()
records={r['selector_value']:r for r in json.load(gzip.open(args.payload,'rt'))['records']}
rows=[json.loads(l) for l in open(args.results)]
checks=[]
for r in rows:
 if not r['ok']:continue
 p=records[r['selector']];start=datetime.datetime(2026,10,28,tzinfo=zoneinfo.ZoneInfo(p['timezone']));jd=start.timestamp()/86400+2440587.5
 out={'selector':r['selector'],'available':r['available']}
 if not r['available']:
  status,events=swe.rise_trans(jd,swe.SUN,swe.CALC_RISE,(p['longitude'],p['latitude'],0),1013.25,15,swe.FLG_MOSEPH)
  out.update(swiss_status=status,ok=status==-2)
 else:
  differences={}
  for key,event in [('sunrise',swe.CALC_RISE),('sunset',swe.CALC_SET)]:
   status,events=swe.rise_trans(jd,swe.SUN,event,(p['longitude'],p['latitude'],0),1013.25,15,swe.FLG_MOSEPH)
   assert status==0,(r['selector'],key,status)
   actual=datetime.datetime.fromisoformat(r[key]).timestamp();reference=(events[0]-2440587.5)*86400
   differences[key]=round(actual-reference,3)
  out.update(difference_seconds=differences,ok=all(abs(v)<=120 for v in differences.values()))
 checks.append(out)
deltas=[abs(v) for c in checks for v in c.get('difference_seconds',{}).values()]
summary={'status':'independent_solar_sanity_check_not_full_panchang_or_identity_certification','date':'2026-10-28','library':'pyswisseph 2.10.3.2 / Swiss Ephemeris '+swe.version,'ephemeris':'Moshier analytical, FLG_MOSEPH','horizon':'Sun upper limb, sea level, standard atmosphere 1013.25 hPa, 15 C','tolerance_seconds':120,'tested_locations':len(checks),'passed':sum(x['ok'] for x in checks),'maximum_absolute_difference_seconds':max(deltas) if deltas else None,'median_absolute_difference_seconds':round(statistics.median(deltas),3) if deltas else None,'exceptions':[c for c in checks if not c['ok']],'limitations':['Compares solar rise/set only, not every Panchang element or transition.','Standardized sea-level refraction is not actual local weather/terrain.','Agreement does not certify place identity, source freshness or historical timezone rules.']}
json.dump({'summary':summary,'checks':checks},open(args.output,'w'),indent=2);print(json.dumps(summary),flush=True)

if summary["exceptions"]: raise SystemExit(1)
