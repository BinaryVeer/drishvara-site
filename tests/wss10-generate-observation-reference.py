import sys,json,datetime,math
# Reference-only pyswisseph 2.10.3.2; never imported by application runtime.
import swisseph as s
places=[('Varanasi',25.3176,82.9739,'Asia/Kolkata'),('Bengaluru',12.9716,77.5946,'Asia/Kolkata'),('London',51.5074,-.1278,'Europe/London'),('New York',40.7128,-74.006,'America/New_York'),('Sydney',-33.8688,151.2093,'Australia/Sydney'),('Tokyo',35.6762,139.6503,'Asia/Tokyo')]
rows=[]
for date in ['1918-10-16T08:55:56+00:00','1991-08-17T04:35:23+00:00','2026-03-29T01:30:00+00:00','2026-11-21T20:00:00+00:00']:
 dt=datetime.datetime.fromisoformat(date);jd=dt.timestamp()/86400+2440587.5
 for name,lat,lon,tz in places:
  rises=[];t=jd-2
  for _ in range(5):
   rc,out=s.rise_trans(t,s.SUN,s.CALC_RISE,(lon,lat,0),1013.25,15,s.FLG_MOSEPH)
   assert rc==0
   rises.append(out[0]);t=out[0]+1/86400
  rise=max(x for x in rises if x<=jd);nxt=min(x for x in rises if x>jd)
  rc,out=s.rise_trans(rise+1/86400,s.SUN,s.CALC_SET,(lon,lat,0),1013.25,15,s.FLG_MOSEPH)
  asc=s.houses_ex(jd,lat,lon,b'P')[1]
  rows.append(dict(utc=dt.isoformat().replace('+00:00','Z'),place=name,latitude=lat,longitude=lon,timezone=tz,midheaven_tropical=asc[1],sunrise_unix=(rise-2440587.5)*86400,sunset_unix=(out[0]-2440587.5)*86400,next_sunrise_unix=(nxt-2440587.5)*86400))
print(json.dumps(dict(reference='Swiss Ephemeris '+s.version,flags='FLG_MOSEPH; sea level; 1013.25hPa; 15C; upper limb',cases=rows),indent=2))
