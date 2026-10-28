import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2),value=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;
if(!value('--directory'))throw Error('--directory required');const directory=value('--directory');
const temporary=fs.mkdtempSync(path.join(process.cwd(),'.panchang-boundary-probe-'));
try{
 const source=fs.readFileSync('supabase/functions/_shared/panchang-runtime.ts','utf8');const modulePath=path.join(temporary,'instrumented.ts');fs.writeFileSync(modulePath,source+'\nexport {classify as verificationClassify};\n');
 const {verificationClassify}=await import(pathToFileURL(modulePath).href);let probes=0;const crossings=new Set();
 for(const line of fs.readFileSync(path.join(directory,'production-cases.jsonl'),'utf8').trim().split('\n')){
  const c=JSON.parse(line);if(!c.result.available)continue;
  for(const [type,transitions] of Object.entries(c.result.transitions))for(const boundary of Object.values(transitions)){
   const ms=Date.parse(boundary.utc),before=verificationClassify(ms-1000).elements[type].index,after=verificationClassify(ms+1000).elements[type].index;
   if(before!==boundary.fromIndex||after!==boundary.toIndex)throw Error(JSON.stringify({selector:c.selector,date:c.date,type,boundary,before,after}));
   probes+=2;crossings.add(type+':'+before+':'+after);
  }
 }
 const result={production_boundary_probes:probes,ordinal_crossings_covered:crossings.size,passed:true,probe_distance_seconds:1};fs.writeFileSync(path.join(directory,'boundary-probes.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
