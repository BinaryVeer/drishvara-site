"""Reference-only independent arithmetic implementation of the declared WSS10 profile.
Ancient formulae and explicitly selected Raman support conventions. No JS imports,
external astrology implementation, ephemeris or publication authorization.
"""
import json, math, datetime, pathlib, bisect
N=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
L=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter']
F=[['Moon','Mars','Jupiter'],['Sun','Mercury'],['Sun','Moon','Jupiter'],['Sun','Venus'],['Sun','Moon','Mars'],['Mercury','Saturn'],['Mercury','Venus']]
E=[['Venus','Saturn'],[],['Mercury'],['Moon'],['Mercury','Venus'],['Sun','Moon'],['Sun','Moon','Mars']]
EX=[10,33,298,165,95,357,200]
MT=[(4,0,20),(1,3,30),(0,0,12),(5,15,20),(8,0,10),(6,0,15),(10,0,20)]
MIN=[390,360,300,420,390,330,300]
NAT=[60,360/7,120/7,180/7,240/7,300/7,60/7]
DISC={'Mars':9.4,'Mercury':6.6,'Jupiter':190.4,'Venus':16.6,'Saturn':158}
DAY=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
HOUR=['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon']
def instant(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()
def distance(a,b):return min((a-b)%360,(b-a)%360)
def sig(x):return int((x%360)//30)
def varga(x,d):
 s=sig(x);u=x%30
 if d==1:return s
 if d==2:return [4,3,3,4][2*(s%2)+int(u>=15)]
 if d==3:return (s+int(u//10)*4)%12
 if d==7:return int((x%360)*7/30)%12
 if d==9:return int((x%360)*3/10)%12
 if d==12:return (s+int(u//2.5))%12
 if d==30:
  cuts,signs=([5,10,18,25],[0,10,8,2,6]) if s%2==0 else ([5,12,20,25],[1,5,11,9,7])
  return signs[bisect.bisect_right(cuts,u)]
 raise ValueError(d)
def aspect(a,b,g):
 x=(b-a)%360
 knots=[0,30,60,90,120,150,180,300,360];values=[0,0,15,45,30,0,60,0,0]
 k=min(len(knots)-2,bisect.bisect_right(knots,x)-1)
 y=values[k]+(values[k+1]-values[k])*(x-knots[k])/(knots[k+1]-knots[k])
 for lo,hi,bonus in {'Mars':[(90,120,15),(210,240,15)],'Jupiter':[(120,150,30),(240,270,30)],'Saturn':[(60,90,45),(270,300,45)]}.get(g,[]):
  if lo<=x<hi:y+=bonus
 return y
def calculate(c):
 t=instant(c['utc']);rise=instant(c['sunriseUtc']);setting=instant(c['sunsetUtc']);nxt=instant(c['nextSunriseUtc']);day=t<setting
 lon={p['graha']:p['longitude']%360 for p in c['planets']};trop={p['graha']:p['tropical']%360 for p in c['planets']}
 asc=c['ascendant']%360;mc=c['midheaven']%360;q=(mc+180-asc)%360
 cusps=[(asc+(h//3//2)*180+(q if h//3%2 else 0)+(h%3)*(q if h//3%2==0 else 180-q)/3)%360 for h in range(12)]
 waxing=(lon['Moon']-lon['Sun'])%360<180
 merc_bad=any(sig(lon[g])==sig(lon['Mercury']) for g in ['Sun','Mars','Saturn']+([] if waxing else ['Moon']))
 good=lambda g:g in ['Jupiter','Venus'] or g=='Moon' and waxing or g=='Mercury' and not merc_bad
 drik=lambda x,exclude:sum(aspect(lon[g],x,g)*((.25 if good(g) else -.25)+(1 if g in ['Mercury','Jupiter'] else 0)) for g in N if g!=exclude)
 elapsed=(t-instant('1899-12-31T18:56:00Z'))/86400
 yr=datetime.datetime.fromtimestamp(t,datetime.timezone.utc).year-1900
 rate=lambda r:elapsed*r*360/1577917828
 means={'Sun':(257.4568+rate(4320000))%360,'Mars':(270.22+rate(2296832))%360,'Jupiter':(220.04+rate(364220)-3.33-.0067*yr)%360,'Saturn':(236.74+rate(146568)+5+.001*yr)%360}
 means.update(Mercury=means['Sun'],Venus=means['Sun'])
 apo={g:means['Sun'] for g in ['Mars','Jupiter','Saturn']}
 apo.update(Mercury=(170.67+rate(17937060)-.00133*yr)%360,Venus=(323.51+rate(7022376)-.001*yr)%360)
 ah=(datetime.date.fromisoformat(c['sunriseLocalDate'])-datetime.date(1827,5,2)).days+1
 lords={'year':DAY[(3+3*(ah//360))%7],'month':DAY[(3+2*(ah//30))%7],'day':DAY[c['dayWeekday']]}
 lords['hora']=HOUR[(HOUR.index(lords['day'])+int((t-rise)//3600))%7]
 third=int(3*((t-rise)/(setting-rise) if day else (t-setting)/(nxt-setting)))
 third_lord=(['Mercury','Sun','Saturn'] if day else ['Moon','Venus','Mars'])[min(third,2)]
 phase=distance(lon['Moon'],lon['Sun'])/3
 out=[]
 for i,g in enumerate(N):
  x=lon[g];s=sig(x);nav=varga(x,9);terms=[]
  for d in [1,2,3,7,9,12,30]:
   ruler=L[varga(x,d)];relation=(1 if ruler in F[i] else -1 if ruler in E[i] else 0)+(1 if (sig(lon[ruler])-s)%12 in [1,2,3,9,10,11] else -1)
   value={2:22.5,1:15,0:7.5,-1:3.75,-2:1.875}[relation]
   if ruler==g:value=30
   if d==1 and s==MT[i][0] and MT[i][1]<=x%30<MT[i][2]:value=45
   terms.append(value)
  female=g in ['Moon','Venus'];male=g in ['Sun','Mars','Jupiter']
  h=(s-sig(asc))%12
  parts={'uccha':distance(x,EX[i]+180)/3,'saptavarga':sum(terms),'oja':15*sum((a%2==1) if female else (a%2==0) for a in [s,nav]),'kendra':[60,30,15][h%3],'drekkana':15 if (male and x%30<10) or (female and x%30>=20) or (not male and not female and 10<=x%30<20) else 0}
  weak=mc+180 if g in ['Sun','Mars'] else mc if female else asc+180 if g in ['Mercury','Jupiter'] else asc
  nath=60 if g=='Mercury' else c['nathaDegrees']/3 if g in ['Moon','Mars','Saturn'] else 60-c['nathaDegrees']/3
  paksha=phase if g in ['Moon','Jupiter','Venus'] or g=='Mercury' and not merc_bad else 60-phase
  # Integrate piecewise slope across the three 30-degree Khandas.
  z=min(trop[g]%180,180-trop[g]%180)
  ayarc=sum(max(0,min(30,z-30*k))*slope for k,slope in enumerate([1.5,1.1,.4]))
  add=g=='Mercury' or ((trop[g]>=180) if g in ['Moon','Saturn'] else trop[g]<180)
  ayana=30+(ayarc/3 if add else -ayarc/3)
  kal={'nath':nath,'paksha':paksha,'tribhaga':60 if g in ['Jupiter',third_lord] else 0,'abda':15 if g==lords['year'] else 0,'masa':30 if g==lords['month'] else 0,'vara':45 if g==lords['day'] else 0,'hora':60 if g==lords['hora'] else 0,'ayana':ayana,'yuddha':0}
  if g=='Sun':cheshta=ayana
  elif g=='Moon':cheshta=paksha
  else:
   # Circular vector mean, avoiding JS's signed-arc midpoint expression.
   a,b=math.radians(means[g]),math.radians(x)
   midpoint=math.degrees(math.atan2(math.sin(a)+math.sin(b),math.cos(a)+math.cos(b)))%360
   cheshta=distance(apo[g],midpoint)/3
  out.append({'graha':g,'sthana_parts':parts,'saptavarga_terms':terms,'sthana':sum(parts.values()),'dig':distance(x,weak)/3,'kala_parts':kal,'cheshta':cheshta,'naisargika':NAT[i],'drik':drik(x,g)})
 rows={p['graha']:p for p in out};wars=[]
 for ai,a in enumerate(list(DISC)):
  for b in list(DISC)[ai+1:]:
   if distance(lon[a],lon[b])<1:wars.append((a,b))
 if len(set(sum((list(p) for p in wars),[])))!=2*len(wars):return None
 for a,b in wars:
  sub=lambda g:rows[g]['sthana']+rows[g]['dig']+sum(v for k,v in rows[g]['kala_parts'].items() if k not in ['ayana','yuddha'])
  transfer=abs(sub(a)-sub(b))/abs(DISC[a]-DISC[b]);winner=min([a,b],key=lambda g:lon[g])
  for g in [a,b]:rows[g]['kala_parts']['yuddha']=transfer*(1 if g==winner else -1)
 for i,p in enumerate(out):
  p['kala']=sum(p['kala_parts'].values());p['total']=sum(p[k] for k in ['sthana','dig','kala','cheshta','naisargika','drik']);p['rupas']=p['total']/60;p['minimum']=MIN[i]
 houses=[]
 if c['twilight_state']!='unresolved':
  for i,x in enumerate(cusps):
   s=sig(x);u=x%30
   kind='insect' if s==7 else 'human' if s in [2,5,6,10] or s==8 and u<15 else 'water' if s in [3,11] or s==9 and u>=15 else 'quadruped'
   weak={'insect':0,'human':6,'water':9,'quadruped':3}[kind]
   left=(cusps[(i-1)%12]+((x-cusps[(i-1)%12])%360)/2)%360;right=(x+((cusps[(i+1)%12]-x)%360)/2)%360
   occupants=[g for g in N if (lon[g]-left)%360<(right-left)%360]
   occupancy=sum(60 if g in ['Mercury','Jupiter'] else -60 if g in ['Sun','Mars','Saturn'] else 0 for g in occupants)
   rising=15 if (s==11 if c['twilight_state']=='twilight' else s in ([2,4,5,6,7,10] if day else [0,1,3,8,9])) else 0
   p={'house':i+1,'midpoint':x,'ruler':L[s],'kind':kind,'lord_strength':rows[L[s]]['total'],'dig':distance(x,cusps[weak])/3,'drik':drik(x,None),'occupant_bonus':occupancy,'rising_bonus':rising}
   p['total']=sum(p[k] for k in ['lord_strength','dig','drik','occupant_bonus','rising_bonus']);houses.append(p)
 return {'planets':out,'houses':houses,'calendar_lords':lords}
def inputs():
 lon=[180+53/60+55/3600,311+17/60+19/3600,229+30/60+34/3600,181+31/60+34/3600,84+49/3600,171+9/60+56/3600,124+22/60+41/3600]
 standard={'profile':'drishvara_bphs27_raman_support_v1_candidate','twilight_state':'clear','utc':'1918-10-16T08:55:56Z','ascendant':298.45,'midheaven':216.6,'nathaDegrees':35,'sunriseUtc':'1918-10-16T00:44:00Z','sunsetUtc':'1918-10-16T12:28:00Z','nextSunriseUtc':'1918-10-17T00:44:00Z','sunriseLocalDate':'1918-10-16','dayWeekday':3,'planets':[{'graha':g,'longitude':x,'tropical':(x+21+16/60)%360} for g,x in zip(N,lon)]}
 yield 'raman_standard_declared_inputs',standard
 for k in range(24):
  c=json.loads(json.dumps(standard));dt=datetime.datetime(1991,8,17,tzinfo=datetime.timezone.utc)+datetime.timedelta(days=k)
  date=dt.date().isoformat();c.update(utc=(dt+datetime.timedelta(hours=k+.125)).isoformat(),sunriseUtc=dt.isoformat(),sunsetUtc=(dt+datetime.timedelta(hours=12)).isoformat(),nextSunriseUtc=(dt+datetime.timedelta(days=1)).isoformat(),sunriseLocalDate=date,dayWeekday=(dt.weekday()+1)%7,nathaDegrees=(k*17)%180,ascendant=(17+k*13)%360)
  c['midheaven']=(c['ascendant']+270+(k%3-1)*20)%360
  c['planets']=[{'graha':g,'longitude':(x+k*11.71)%360,'tropical':(x+k*11.71+24)%360} for g,x in zip(N,lon)]
  yield 'synthetic_clock_phase_geometry_'+str(k),c
 # Isolated wars: all ten starry-graha pairs, both winner orderings.
 import itertools
 for number,(a,b) in enumerate(itertools.combinations(DISC,2)):
  c=json.loads(json.dumps(standard))
  for p in c['planets']:
   if p['graha'] in [a,b]:p['longitude']=220+(.4 if p['graha']==(a if number%2 else b) else 0);p['tropical']=(p['longitude']+21+16/60)%360
  yield 'isolated_war_'+a+'_'+b,c
 for mode in ['twilight','unresolved']:
  c=json.loads(json.dumps(standard));c['twilight_state']=mode
  yield 'explicit_twilight_'+mode,c
def canonical(value):
 if isinstance(value,float):return round(value,8)
 if isinstance(value,list):return [canonical(v) for v in value]
 if isinstance(value,dict):return {k:canonical(v) for k,v in value.items()}
 return value
if __name__=='__main__':
 cases=[]
 for name,c in inputs():
  value=calculate(c)
  if value is not None:cases.append({'name':name,'input':c,'expected':canonical(value)})
 result={'profile':'drishvara_bphs27_raman_support_v1_candidate','scope':'Independent arithmetic under declared diagnostic synthesis; not independent full-profile source authorization, ephemeris or interval proof','cases':cases}
 pathlib.Path('tests/fixtures/wss11-strength-reference.json').write_text(json.dumps(result,indent=2)+'\n')
 print('Generated',len(cases),'independent full-component arithmetic cases')
