"""Independent arithmetic fixture expressions for ancient formulae.
No ephemeris, astrological outcome, scholar approval or copied engine code.
"""
import json,random,math,bisect,pathlib
rng=random.Random(270621)
angles=[0,15,29.999999,30,59.999999,60,89.999999,90,119.999999,120,149.999999,150,179.999999,180,209.999999,210,239.999999,240,269.999999,270,299.999999,300,330,359.999999]+[rng.random()*360 for _ in range(96)]
def varga(l,d):
 s=int(l//30);part=l%30
 if d==1:return s
 if d==2:return [[4,3],[3,4]][s%2][int(part//15)]
 if d==3:return (s+4*int(part//10))%12
 if d==7:return int(math.floor(l*7/30+1e-12))%12
 if d==9:return int(math.floor(l*3/10+1e-12))%12
 if d==12:return (s+int(part//2.5))%12
 if d==30:
  limits,signs=([5,10,18,25],[0,10,8,2,6]) if s%2==0 else ([5,12,20,25],[1,5,11,9,7])
  return signs[bisect.bisect_right(limits,part)]
def aspect(d,n):
 knots=[30,60,90,120,150,180,300];values=[0,15,45,30,0,60,0]
 if d<30 or d>=300:v=0
 else:
  i=bisect.bisect_right(knots,d)-1
  v=values[i]+(values[i+1]-values[i])*(d-knots[i])/(knots[i+1]-knots[i])
 for lo,hi,bonus in {'Mars':[(90,120,15),(210,240,15)],'Jupiter':[(120,150,30),(240,270,30)],'Saturn':[(60,90,45),(270,300,45)]}.get(n,[]):
  if lo<=d<hi:v+=bonus
 return v
names=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
data={'basis':'BPHS 6 divisional mappings; BPHS 26/27 and Sripathi additive angular aspect interpolation','qualification':'Independent arithmetic expressions, not independent ephemeris or scholarly approval','cases':[{'longitude':a,'vargas':{str(d):varga(a,d) for d in [1,2,3,7,9,12,30]},'aspects':{n:aspect(a,n) for n in names}} for a in angles]}
p=pathlib.Path('tests/fixtures/wss10-bala-arithmetic-reference.json');p.write_text(json.dumps(data,indent=2)+'\n');print('Generated',len(angles)*14,'formula values')
