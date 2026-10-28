import json,gzip,urllib.request,concurrent.futures,time,datetime,os,argparse
parser=argparse.ArgumentParser();parser.add_argument("--payload",default="data/location-releases/city-restoration-20261028.json.gz");parser.add_argument("--output",required=True);parser.add_argument("--workers",type=int,default=4,choices=range(1,9));args=parser.parse_args()
records=json.load(gzip.open(args.payload,'rt'))['records']
url='https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang'
output=args.output
def check(r):
 t=time.monotonic();out={'selector':r['selector_value'],'date':'2026-10-28'}
 for attempt in range(2):
  try:
   req=urllib.request.Request(url,data=json.dumps({'civil_date':'2026-10-28','mode':'named_location','selector_value':r['selector_value']}).encode(),headers={'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=45) as response:d=json.load(response)
   b=d['location_basis'];p=d['panchang']['result']
   assert b['canonical_place_id']==r['canonical_place_id'] and b['timezone']==r['timezone']
   assert all(abs(b[k]-r[k])<1e-12 for k in ['latitude','longitude'])
   assert b['automatic_place_substitution_performed'] is False and b['automatic_timezone_substitution_performed'] is False
   assert all(v is False for v in d['privacy'].values())
   if p['available']:
    for k in ['sunrise','sunset']:assert p[k]['local'] and p[k]['utc']
    for k in ['tithi','nakshatra','yoga','karana']:assert p['elements'][k]['name']
    assert p['window']['civil_date']=='2026-10-28' and p['window']['timezone']==r['timezone']
   out.update(ok=True,available=p['available'],reason=p.get('reason') or p.get('availability_reason'),sunrise=p.get('sunrise',{}).get('local'),sunset=p.get('sunset',{}).get('local'),timezone=b['timezone'],runtime=d['runtime']['runtime_release_id']);break
  except Exception as e:
   out.update(ok=False,error=str(e)[:250])
 out['seconds']=round(time.monotonic()-t,3);return out
start=time.time();results=[json.loads(line) for line in open(output)] if os.path.exists(output) else [];done={r['selector'] for r in results if r['ok']};records=[r for r in records if r['selector_value'] not in done]
with open(output,'a') as file,concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
 for r in pool.map(check,records):
  results.append(r);file.write(json.dumps(r)+'\n');file.flush()
  if len(results)%25==0 or not r['ok']:print(json.dumps({'completed':len(results),'failures':sum(not x['ok'] for x in results),'elapsed_seconds':round(time.time()-start),'last':r['selector']}),flush=True)
results=list({r['selector']:r for r in results}.values())
summary={'date':'2026-10-28','tested':len(results),'passed':sum(r['ok'] for r in results),'available':sum(r.get('available') is True for r in results),'unavailable':sum(r.get('available') is False for r in results),'failures':[r for r in results if not r['ok']],'elapsed_seconds':round(time.time()-start),'max_seconds':max(r['seconds'] for r in results)}
json.dump(summary,open(output+'.summary.json','w'),indent=2);print(json.dumps(summary),flush=True)

if summary["failures"]: raise SystemExit(1)
