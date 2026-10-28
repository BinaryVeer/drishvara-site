import json,math,datetime,functools,collections,statistics,swisseph as swe
from pathlib import Path
import argparse
parser=argparse.ArgumentParser();parser.add_argument("--directory",required=True);parser.add_argument("--timescale",choices=["matched","native"],default="matched");parser.add_argument("--strict",action="store_true");args=parser.parse_args()
BASE=Path(args.directory);PLAN=json.load(open(BASE/'plan.json'));ATOL=PLAN['angular_tolerance_degrees'];TTOL=PLAN['transition_tolerance_seconds'];swe.set_sid_mode(swe.SIDM_LAHIRI)
def jd(iso):return datetime.datetime.fromisoformat(iso.replace('Z','+00:00')).timestamp()/86400+2440587.5
def diff(a,b):return (a-b+180)%360-180
def delta_t(t):
 # Published Espenak-Meeus polynomials, independently evaluated in Python.
 # Fractional year follows the documented production epoch convention.
 y=2000+(t-2451545.0-14)/365.24217
 if y<1900:
  u=y-1860;return 7.62+.5737*u-.251754*u**2+.01680668*u**3-.0004473624*u**4+u**5/233174
 if y<1920:
  u=y-1900;return -2.79+1.494119*u-.0598939*u**2+.0061966*u**3-.000197*u**4
 if y<1941:
  u=y-1920;return 21.2+.84493*u-.076100*u**2+.0020936*u**3
 if y<1961:
  u=y-1950;return 29.07+.407*u-u*u/233+u**3/2547
 if y<1986:
  u=y-1975;return 45.45+1.067*u-u*u/260-u**3/718
 if y<2005:
  u=y-2000;return 63.86+.3345*u-.060374*u**2+.0017275*u**3+.000651814*u**4+.00002373599*u**5
 if y<2050:
  u=y-2000;return 62.92+.32217*u+.005589*u*u
 u=(y-1820)/100;return -20+32*u*u-.5628*(2150-y)
@functools.lru_cache(maxsize=32768)
def primitives(t):
 tt=t+(delta_t(t)/86400 if args.timescale=="matched" else swe.deltat_ex(t,swe.FLG_MOSEPH))
 sun,sf=swe.calc(tt,swe.SUN,swe.FLG_MOSEPH);moon,mf=swe.calc(tt,swe.MOON,swe.FLG_MOSEPH|swe.FLG_TRUEPOS)
 assert sf&swe.FLG_MOSEPH and mf&swe.FLG_MOSEPH
 a=(23.85675+0.013969*((tt-2451545.0)/365.242189))%360
 return sun[0],moon[0],a,swe.get_ayanamsa(tt)
def angle(kind,t,profile='linear'):
 sun,moon,linear,standard=primitives(t);a=linear if profile=='linear' else standard
 return {'elongation':(moon-sun)%360,'moonSidereal':(moon-a)%360,'yoga':(moon+sun-2*a)%360}[kind]
@functools.lru_cache(maxsize=32768)
def crossing(kind,target,day):
 # Search around an independent civil-JD anchor, never around the production root.
 lo,hi=day-3,day+4
 fl,fh=diff(angle(kind,lo),target),diff(angle(kind,hi),target)
 if not fl<=0<=fh:raise ValueError(('unbracketed reference boundary',kind,target,day,fl,fh))
 for _ in range(45):
  mid=(lo+hi)/2;fm=diff(angle(kind,mid),target)
  if fm<0:lo=mid
  else:hi=mid
  if (hi-lo)*86400<0.05:break
 return (lo+hi)/2
DEFS={'tithi':('elongation',12,30),'nakshatra':('moonSidereal',360/27,27),'yoga':('yoga',360/27,27),'karana':('elongation',6,60)}
counts=collections.Counter();maxangles=collections.defaultdict(float);maxroots=collections.defaultdict(float);rooterrors=[];angerrors=[];issues=[];near=[];standard_differences=[];unavailable=[];boundaryprobes=0;crossings_seen=set();outputs=[]
for line in open(BASE/'production-cases.jsonl'):
 c=json.loads(line);r=c['result'];counts['cases']+=1
 if not r['available']:
  unavailable.append({k:c[k] for k in ['selector','date','latitude','longitude','timezone']}|{'reason':r['reason']});continue
 counts['available']+=1;t=jd(r['sunrise']['utc']);day=math.floor(t);state=primitives(t);profile_delta=diff(state[2],state[3]);out={'selector':c['selector'],'date':c['date'],'checks':{}}
 for typ,(kind,segment,total) in DEFS.items():
  p=r['elements'][typ];a=angle(kind,t);index=int(a//segment)+1;error=abs(diff(p['angle'],a));angerrors.append(error);maxangles[typ]=max(maxangles[typ],error);counts['element_comparisons']+=1
  boundary_distance=min(a%segment,segment-a%segment);same=p['index']==index
  if not same:
   item={'selector':c['selector'],'date':c['date'],'type':typ,'production':p['index'],'reference':index,'boundary_distance_degrees':boundary_distance,'angle_difference_degrees':error}
   precision=r.get('precision',{});item['handled_by_runtime_review_policy']=bool(precision.get('policy_id')=='drishvara_boundary_review_v1' and precision.get('requires_review') and precision.get('anchor')=='sunrise' and 0<precision.get('review_window_seconds',0)<=180 and any(v.get('element')==typ and v.get('distance_seconds',999)<=precision['review_window_seconds'] for v in precision.get('affected_elements',[])))
   if boundary_distance<=ATOL:near.append(item)
   else:issues.append(item|{'issue':'index_disagreement_away_from_boundary'})
  if error>ATOL:issues.append({'selector':c['selector'],'date':c['date'],'type':typ,'issue':'angular_tolerance_exceeded','difference_degrees':error})
  stdindex=int(angle(kind,t,'standard')//segment)+1
  if stdindex!=index:standard_differences.append({'selector':c['selector'],'date':c['date'],'type':typ,'linear_index':index,'standard_lahiri_index':stdindex,'ayanamsha_difference_degrees':profile_delta})
  tc=r['transitions'][typ];roots={}
  for direction in ['previous','next']:
   ptrans=tc[direction];target=((ptrans['toIndex']-1)*segment)%360;ref=crossing(kind,target,day);err=(jd(ptrans['utc'])-ref)*86400;maxroots[typ]=max(maxroots[typ],abs(err));rooterrors.append(abs(err));counts['transition_comparisons']+=1;roots[direction]={'reference_utc':datetime.datetime.fromtimestamp((ref-2440587.5)*86400,datetime.timezone.utc).isoformat(),'difference_seconds':round(err,6)}
   if abs(err)>TTOL:issues.append({'selector':c['selector'],'date':c['date'],'type':typ,'direction':direction,'issue':'transition_tolerance_exceeded','difference_seconds':err})
   # Independent reference changes across its own root; production metadata must carry the same ordinal pair.
   before=int(angle(kind,ref-1/86400)//segment)+1;after=int(angle(kind,ref+1/86400)//segment)+1
   assert after==(before%total)+1,(typ,ref,before,after)
   assert ptrans['fromIndex']==before and ptrans['toIndex']==after,(c['selector'],typ,direction,ptrans,before,after)
   crossings_seen.add((typ,ptrans['fromIndex'],ptrans['toIndex']))
   boundaryprobes+=2
  assert jd(tc['previous']['utc'])<=t<jd(tc['next']['utc'])
  out['checks'][typ]={'same_index':same,'angle_difference_degrees':round(error,9),'standard_lahiri_same_index':stdindex==index,'transitions':roots}
 outputs.append(out)
 if counts['available']%500==0:print(json.dumps({'checked':counts['available'],'issues':len(issues),'near_boundary_index_differences':len(near)}),flush=True)
unhandled=[v for v in near if not v.get('handled_by_runtime_review_policy')]
summary={'status':'independent_comparison_complete_review_required' if issues or unhandled else 'independent_comparison_passed_with_explicit_boundary_review' if near else 'independent_comparison_passed','production_cases':counts['cases'],'available_cases':counts['available'],'unavailable_cases':unavailable,'element_comparisons':counts['element_comparisons'],'transition_comparisons':counts['transition_comparisons'],'boundary_probes':boundaryprobes,'ordinal_crossings_covered':len(crossings_seen),'maximum_angle_difference_degrees':dict(maxangles),'maximum_transition_difference_seconds':dict(maxroots),'median_transition_difference_seconds':statistics.median(rooterrors),'tolerances':PLAN,'issues':issues,'near_boundary_index_differences':near,'unhandled_boundary_index_differences':unhandled,'standard_lahiri_index_differences':standard_differences,'reference':'pyswisseph 2.10.3.2 / Swiss Ephemeris '+swe.version,'reference_flags':{'sun':'MOSEPH, apparent geocentric true equinox of date','moon':'MOSEPH | TRUEPOS, geocentric true equinox of date'},'limitations':['The primary comparison intentionally shares the documented linear ayanamsha formula, but uses independent solar/lunar ephemerides and boundary searches.','Standard Swiss Lahiri comparison is reported separately; it is not silently substituted for the approved profile.','The matched-timescale run independently evaluates Espenak-Meeus delta-T; the native Swiss timescale comparison is retained separately.','These are numerical cross-engine checks, not validation of every religious observance rule or source identity.']}
json.dump(summary,open(BASE/('comparison-summary.json' if args.timescale=='matched' else 'native-timescale-summary.json'),'w'),indent=2);import gzip
with gzip.open(BASE/('comparison-details.json.gz' if args.timescale=='matched' else 'native-timescale-details.json.gz'),'wt') as f:json.dump(outputs,f,separators=(',',':'))
print(json.dumps({k:v for k,v in summary.items() if k not in ['standard_lahiri_index_differences','near_boundary_index_differences','issues']}));print(json.dumps({'issues':len(issues),'near_boundary_index_differences':len(near),'standard_lahiri_index_differences':len(standard_differences)}))

if args.strict and (issues or unhandled): raise SystemExit(2)

