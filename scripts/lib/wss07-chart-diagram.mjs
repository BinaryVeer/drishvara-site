/** Accessible North/South Indian chart presentation from audited house rows.
 * Labels use textContent; this module never calculates or authorizes a chart. */
const NS="http://www.w3.org/2000/svg";
const NORTH=[[200,98],[105,43],[45,104],[98,194],[45,284],[105,340],
 [200,290],[295,340],[355,284],[302,194],[355,104],[295,43]];
const SOUTH=[[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0]];
const SIGNS=["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const HI=["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
const ABBR={Sun:"Su",Moon:"Mo",Mercury:"Me",Venus:"Ve",Mars:"Ma",Jupiter:"Ju",Saturn:"Sa",Rahu:"Ra",Ketu:"Ke",
 सूर्य:"सू",चन्द्र:"चं",बुध:"बु",शुक्र:"शु",मंगल:"मं",बृहस्पति:"गु",शनि:"श",राहु:"रा",केतु:"के"};
export function createAuditedChartDiagram(document,{rows,language="en",layout="north",title=""}={}){
 if(!["en","hi"].includes(language)||!["north","south"].includes(layout))throw new RangeError("Unsupported chart display");
 if(!Array.isArray(rows)||rows.length!==12||rows.some(r=>!r.sign||typeof r.grahas!=="string"))return null;
 const svg=document.createElementNS(NS,"svg");
 svg.setAttribute("viewBox","0 0 400 400");svg.setAttribute("role","img");
 svg.setAttribute("class","wss-chart-diagram");svg.dataset.chartLayout=layout;
 const label=title+" · "+(language==="hi"?(layout==="north"?"उत्तर भारतीय शैली":"दक्षिण भारतीय शैली"):
   layout==="north"?"North Indian layout":"South Indian layout");
 svg.setAttribute("aria-label",label);
 const el=(name,attrs={},text=null,parent=svg)=>{
  const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));
  if(text!==null)n.textContent=text;parent.append(n);return n;
 };
 el("title",{},label);
 el("desc",{},rows.map(r=>r.label+": "+r.sign+"; "+r.grahas).join(". "));
 el("rect",{x:1,y:1,width:398,height:398,fill:"#10263d",stroke:"#dfbb70","stroke-width":2});
 if(layout==="north")el("path",{d:"M0 0L400 400M400 0L0 400M200 0L400 200L200 400L0 200Z",
  fill:"none",stroke:"#dfbb70","stroke-width":1.5});
 else{
  for(const n of [100,200,300]){
   el("path",{d:`M${n} 0V100M${n} 300V400M0 ${n}H100M300 ${n}H400`,stroke:"#dfbb70",fill:"none"});
  }
  el("rect",{x:100,y:100,width:200,height:200,stroke:"#dfbb70",fill:"none"});
  el("text",{x:200,y:195,"text-anchor":"middle",fill:"#dfbb70","font-size":16},title);
 }
 rows.forEach((row,i)=>{
  const sign=(language==="hi"?HI:SIGNS).indexOf(row.sign);
  if(sign<0)throw new RangeError("Unknown audited sign label");
  const [x,y]=layout==="north"?NORTH[i]:[SOUTH[sign][0]*100+50,SOUTH[sign][1]*100+24];
  const group=el("g",{"data-house":i+1});
  el("title",{},row.label+": "+row.sign+"; "+row.grahas,group);
  const base={x,"text-anchor":"middle","font-family":"Arial, sans-serif"};
  el("text",{...base,y,fill:"#dfbb70","font-size":10},row.label,group);
  el("text",{...base,y:y+14,fill:"#f0f5f7","font-size":11},row.sign,group);
  const names=row.grahas==="—"?[]:row.grahas.split(", ").map(g=>ABBR[g]||g);
  for(let line=0;line<Math.ceil(names.length/3);line++)
   el("text",{...base,y:y+29+line*12,fill:"#b9c8d6","font-size":10},names.slice(line*3,line*3+3).join(" · "),group);
 });
 return svg;
}
