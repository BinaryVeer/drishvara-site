import json,urllib.request,concurrent.futures,datetime
from pathlib import Path
import argparse
parser=argparse.ArgumentParser();parser.add_argument("--directory",required=True);parser.add_argument("--strict",action="store_true");args=parser.parse_args()
b=Path(args.directory);cases={}
wanted=[('city-gn-344979','1900-01-02'),('city-gn-1790371','2026-10-28'),('city-gn-3838583','2026-10-28'),('lgd-village-254106','2026-10-28'),('city-gn-2643743','2026-10-25'),('city-gn-5128581','2026-10-25'),('varanasi-uttar-pradesh-india','2026-10-28')]
for line in open(b/'production-cases.jsonl'):
 c=json.loads(line)
 if (c['selector'],c['date']) in wanted:cases[(c['selector'],c['date'])]=c
assert len(cases)==len(wanted)
def run(key):
 c=cases[key];req=urllib.request.Request('https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang',data=json.dumps({'civil_date':c['date'],'mode':'named_location','selector_value':c['selector']}).encode(),headers={'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=45) as res:d=json.load(res)
 actual=d['panchang']['result'];expected=c['result'];errors=[]
 for typ in ['tithi','nakshatra','yoga','karana']:
  if actual['elements'][typ]['index']!=expected['elements'][typ]['index']:errors.append(typ+' index')
  for side in ['previous','next']:
   a=(((actual.get('transitions') or {}).get(typ) or {}).get(side) or {}).get('utc');e=expected['transitions'][typ][side]['utc']
   if a!=e:errors.append(typ+' '+side+' transition')
 assert all(v is False for v in d['privacy'].values())
 return {'selector':c['selector'],'date':c['date'],'source':d['panchang']['source'],'same_as_deployed_source':not errors,'differences':errors}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:r=list(pool.map(run,wanted))
json.dump(r,open(b/'live-parity.json','w'),indent=2);print(json.dumps(r),flush=True)

if args.strict and any(not x["same_as_deployed_source"] for x in r): raise SystemExit(2)
