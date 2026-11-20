"""Separate Python arithmetic reference from synthetic Swiss longitudes.
No production JS formulas are imported. Dates use Decimal milliseconds.
This qualifies arithmetic under named conventions, not astrological forecasts.
"""
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from datetime import datetime
import json

source=json.loads(Path("wss08-qa/synthetic_swiss_reference.json").read_text())
LORDS=[("Ketu",7),("Venus",20),("Sun",6),("Moon",10),("Mars",7),
       ("Rahu",18),("Jupiter",16),("Saturn",19),("Mercury",17)]
D10_START=[0,9,2,11,4,1,6,3,8,5,10,7]
def vargas(value):
    angle=Decimal(str(value))%Decimal(360)
    sign=int(angle//30);degree=angle-sign*30
    return {"D9":int((angle*Decimal(9))//30)%12+1,
            "D10":(D10_START[sign]+int(degree//3))%12+1}
def dasha(moon,utc,days):
    width=Decimal(40)/3
    angle=Decimal(str(moon));index=int(angle//width)
    fraction=(angle-index*width)/width
    birth=Decimal(str(datetime.fromisoformat(utc.replace("Z","+00:00")).timestamp()))*1000
    unit=Decimal(days)*86400000
    cursor=birth-fraction*LORDS[index%9][1]*unit
    periods=[]
    stamp=lambda n:int(n.to_integral_value(rounding=ROUND_HALF_UP))
    for i in range(10):
        major=(index+i)%9;lord,years=LORDS[major];end=cursor+years*unit
        antar=[];sub=cursor
        for j in range(9):
            name,y=LORDS[(major+j)%9]
            finish=end if j==8 else sub+Decimal(years)*unit*y/120
            antar.append({"lord":name,"start_ms":stamp(sub),"end_ms":stamp(finish)})
            sub=finish
        periods.append({"lord":lord,"start_ms":stamp(cursor),"end_ms":stamp(end),"antar":antar})
        cursor=end
    return periods
cases=[]
for f in source["fixtures"]:
    bodies={**f["grahas"],"Ketu":(f["grahas"]["Rahu"]+180)%360,
            "Lagna":f["lagna_sidereal_degrees"]}
    cases.append({"utc":f["utc"],"latitude":f["latitude"],"longitude":f["longitude"],
      "moon":f["grahas"]["Moon"],
      "vargas":{name:vargas(lon) for name,lon in bodies.items()},
      "periods":{key:dasha(f["grahas"]["Moon"],f["utc"],days)
        for key,days in [("civil_365_25","365.25"),("savana_360","360")]}})
Path("wss08-qa/varga-dasha-reference.json").write_text(json.dumps({
 "synthetic_only":True,"arithmetic":"Independent Python Decimal; explicit D10 starts and D9 longitude multiplication",
 "interpretation_approved":False,"fixtures":cases},separators=(",",":")))
print("Generated independent Python Varga/period arithmetic for",len(cases),"synthetic charts")
