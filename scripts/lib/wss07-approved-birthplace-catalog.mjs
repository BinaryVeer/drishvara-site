/**
 * WSS07: approved birth-place resolver / private Kundali catalog contract.
 *
 * Reuses the EXISTING DrishvaraV2Location.loadApprovedLocations() source,
 * not a new hardcoded city list or user-supplied unchecked place names.
 * Does not fetch, store, send or log any birth/name inputs.
 * The 3,266 production records are governed by the 20261026 release catalog.
 */
export const WSS07_CATALOG_VERSION="20261026";
export const WSS07_CATALOG_EXPECTED_COUNT=3266;
const APPROVALS=["canonical_place_approved","coordinate_approved","timezone_approved",
 "public_selection_approved","computation_approved","public_output_allowed"];
const normal=value=>String(value??"").normalize("NFKD")
 .replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("und")
 .replace(/[^\p{L}\p{N}]+/gu," ").trim();

function normaliseSource(value,index) {
 if(!value||typeof value!=="object")throw new TypeError("Invalid governed location "+index);
 const src=value.source||value;
 if(APPROVALS.some(k=>src[k]!==true))throw new RangeError("Unapproved birth place in catalog "+index);
 const selectorValue=String(value.selectorValue||value.selector_value||"").trim();
 const canonicalPlaceId=String(value.canonicalPlaceId||value.canonical_place_id||"").trim();
 const displayLabel=String(value.displayLabel||value.display_label||"").trim();
 const timezone=String(value.timezone||"").trim();
 const latitude=Number(value.latitude),longitude=Number(value.longitude);
 const searchLabels=value.searchLabels||value.search_labels||src.search_labels||[];
 if(!selectorValue||!canonicalPlaceId||!displayLabel||!timezone)
   throw new RangeError("Incomplete approved birthplace "+index);
 if(!Number.isFinite(latitude)||Math.abs(latitude)>90||
    !Number.isFinite(longitude)||Math.abs(longitude)>180)
   throw new RangeError("Invalid approved birthplace coordinates "+index);
 if(!Array.isArray(searchLabels))
   throw new RangeError("Birthplace aliases must be explicit source values");
 try {new Intl.DateTimeFormat("en",{timeZone:timezone}).format(new Date());}
 catch {throw new RangeError("Unsupported historical IANA timezone at "+index);}
 return Object.freeze({
   selectorValue,canonicalPlaceId,displayLabel,timezone,latitude,longitude,
   searchLabels:Object.freeze(searchLabels.filter(x=>typeof x==="string").slice()),
   validForLagna:Math.abs(latitude)<=65,
   timezoneProvenance:"approved_catalog_IANA_platform_tzdb_unpinned",
   geographicRole:"approved_city_or_locality_reference_point",
   approved:true,
   indexSearch:normal([displayLabel,canonicalPlaceId,selectorValue,timezone,...searchLabels].join(" "))
 });
}
export function qualifyApprovedBirthCatalog(records,{
 expectedCount=WSS07_CATALOG_EXPECTED_COUNT,
 catalogVersion=WSS07_CATALOG_VERSION
}={}){
 if(catalogVersion!==WSS07_CATALOG_VERSION)
   throw new RangeError("Unsupported birth catalog version");
 if(!Array.isArray(records)||!Number.isInteger(expectedCount)||expectedCount<1||
    records.length!==expectedCount)
   throw new RangeError("Active approved catalog count mismatch");
 const entries=records.map(normaliseSource);
 const bySelector=new Map(),byCanonical=new Set();
 for(const record of entries){
   if(bySelector.has(record.selectorValue)||byCanonical.has(record.canonicalPlaceId))
     throw new RangeError("Duplicate location identity in governed birth catalog");
   bySelector.set(record.selectorValue,record);
   byCanonical.add(record.canonicalPlaceId);
 }
 return Object.freeze({
   status:"approved_birth_catalog",
   version:catalogVersion,
   approvedCount:entries.length,
   records:Object.freeze(entries),
   bySelector,
   privacy:"catalog_only_no_birth_or_name_input_transmitted",
   automaticAliasSelection:false
 });
}
export async function loadGovernedBirthCatalog(locationApi,{
 expectedCount=WSS07_CATALOG_EXPECTED_COUNT
}={}){
 if(!locationApi||typeof locationApi.loadApprovedLocations!=="function")
   throw new RangeError("Existing approved Drishvara location runtime is unavailable");
 const records=await locationApi.loadApprovedLocations();
 return qualifyApprovedBirthCatalog(records,{expectedCount});
}
export function searchGovernedBirthCatalog(catalog,query,{limit=30}={}){
 if(!catalog||catalog.status!=="approved_birth_catalog")
   throw new RangeError("Verified birthplace catalog required");
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new RangeError("Search limit must be 1..100");
 const folded=normal(query);
 if(!folded||folded.length>120)return [];
 const tokens=folded.split(" ");
 const matches=catalog.records.filter(r=>tokens.every(token=>r.indexSearch.includes(token)));
 const prefix=r=>normal(r.displayLabel).startsWith(folded)?0:1;
 matches.sort((a,b)=>prefix(a)-prefix(b)||
   a.displayLabel.localeCompare(b.displayLabel,"en")||
   a.selectorValue.localeCompare(b.selectorValue));
 return matches.slice(0,limit).map(r=>({
   selectorValue:r.selectorValue,displayLabel:r.displayLabel,
   timezone:r.timezone,validForLagna:r.validForLagna
 }));
}
export function resolveSelectedApprovedBirthPlace(catalog,selectorValue){
 if(!catalog||catalog.status!=="approved_birth_catalog")
   return {status:"catalog_unavailable"};
 const key=String(selectorValue||"").trim();
 const r=catalog.bySelector.get(key);
 if(!r)return {status:"unknown_unselected_birthplace",requiresExplicitSelection:true};
 return {
   status:"approved_birthplace_selected",
   selectorValue:r.selectorValue,canonicalPlaceId:r.canonicalPlaceId,
   label:r.displayLabel,
   latitude:r.latitude,longitude:r.longitude,timezone:r.timezone,
   validForLagna:r.validForLagna,
   preciseBirthCoordinatesNotImplied:true,
   timezoneBasis:r.timezoneProvenance,
   locationBasis:r.geographicRole,
   providerReleaseId:catalog.version
 };
}
