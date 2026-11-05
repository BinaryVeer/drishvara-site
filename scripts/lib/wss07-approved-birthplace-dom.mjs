/**
 * WSS07 private staging birth-place selector — connects to the SAME approved
 * world catalogue as existing public Panchang/Star Reflection.
 *
 * This component does not load a second location database. The source owns
 * network access via DrishvaraV2Location.loadApprovedLocations(), and its
 * payload contains only the public approved place catalog, not birth details.
 */
import {
 loadGovernedBirthCatalog,searchGovernedBirthCatalog,
 resolveSelectedApprovedBirthPlace
} from "./wss07-approved-birthplace-catalog.mjs";
const COPY={
 en:{
  search:"Search approved birthplaces (city or alias)",
  choose:"Choose a matching approved birthplace",
  placeholder:"Type a city, locality or alias",
  loading:"Loading the existing approved global place catalogue…",
  unavailable:"Approved place catalogue unavailable. Do not guess a birthplace or use a five-city fallback.",
  ready:n=>"Approved global birthplaces: "+n+". Type to search; select an explicit result.",
  matches:n=>"Matching approved places: "+n+". Select one of the displayed results.",
  noMatches:"No matching approved place. Try an alternate spelling or verified coordinates in the future release.",
  lagnaUnavailable:"This location exceeds the current ±65° Lagna calculation range; precise chart remains unavailable."
 },
 hi:{
  search:"अनुमोदित जन्मस्थान खोजें (शहर या उपनाम)",
  choose:"मिले हुए सत्यापित जन्मस्थान का चयन करें",
  placeholder:"शहर, कस्बा या दूसरा नाम लिखें",
  loading:"मौजूदा अनुमोदित विश्व स्थान सूची लोड हो रही है…",
  unavailable:"अनुमोदित स्थान सूची अनुपलब्ध है। जन्मस्थान का अनुमान या पाँच शहरों की अपूर्ण सूची का उपयोग नहीं होगा।",
  ready:n=>"अनुमोदित जन्मस्थान: "+n+"। खोजकर स्पष्ट रूप से चयन करें।",
  matches:n=>"मिलते हुए अनुमोदित स्थान: "+n+"। सूची में से एक चुनें।",
  noMatches:"अनुमोदित स्थान नहीं मिला। दूसरे नाम से खोजें या अगले संस्करण में सत्यापित निर्देशांक दें।",
  lagnaUnavailable:"यह स्थान वर्तमान ±65° लग्न गणना सीमा के बाहर है; निश्चित कुंडली अनुपलब्ध है।"
 }
};
export async function mountApprovedBirthPlaceInput({
 input,select,status,searchLabel,selectLabel,locationApi,
 onSelectionChanged=()=>{},language="en"
}={}){
 if(!input||!select||!status||!searchLabel||!selectLabel)
   throw new TypeError("All existing birth-place control elements are required");
 if(!["en","hi"].includes(language))throw new RangeError("English/Hindi only");
 let catalog=null,lang=language,matching=[],ready=false;
 const local=()=>COPY[lang];
 const setLanguage=next=>{
   if(!["en","hi"].includes(next))throw new RangeError("English/Hindi only");
   lang=next;searchLabel.textContent=local().search;selectLabel.textContent=local().choose;
   input.placeholder=local().placeholder;
   status.textContent=!ready?local().loading:
     input.value.trim()?(matching.length?local().matches(matching.length):local().noMatches):
     local().ready(catalog.approvedCount);
 };
 setLanguage(lang);
 const clearOptions=()=>{
   const option=new Option(lang==="hi"?"अनुमोदित स्थान चुनें":"Choose approved place","");
   select.replaceChildren(option);
   select.value="";
 };
 const search=()=>{
   clearOptions();
   onSelectionChanged();
   if(!catalog){status.textContent=local().unavailable;return;}
   matching=searchGovernedBirthCatalog(catalog,input.value,{limit:60});
   for(const place of matching)select.add(new Option(
      place.displayLabel+" · "+place.timezone+(place.validForLagna?"":" ⚠"),
      place.selectorValue));
   select.disabled=matching.length===0;
   status.textContent=!input.value.trim()?local().ready(catalog.approvedCount):
     matching.length?local().matches(matching.length):local().noMatches;
 };
 input.addEventListener("input",search);
 select.addEventListener("change",()=>{
   onSelectionChanged();
   const result=resolveSelectedApprovedBirthPlace(catalog,select.value);
   if(result.status==="approved_birthplace_selected"&&!result.validForLagna)
     status.textContent=local().lagnaUnavailable;
 });
 clearOptions();
 try{
   catalog=await loadGovernedBirthCatalog(locationApi);
   ready=true;
   input.disabled=false;
   select.disabled=true;
   status.dataset.catalogStatus="approved_3266";
   search();
 }catch {
   catalog=null;ready=false;input.disabled=true;select.disabled=true;
   clearOptions();
   status.dataset.catalogStatus="unavailable_fail_closed";
   status.textContent=local().unavailable;
 }
 return Object.freeze({
   status:()=>ready?"ready_3266":"unavailable",
   count:()=>catalog?.approvedCount??0,
   selectBirthPlace:()=>resolveSelectedApprovedBirthPlace(catalog,select.value),
   clear:()=>{
     input.value="";clearOptions();matching=[];if(ready)select.disabled=true;
     status.textContent=ready?local().ready(catalog.approvedCount):local().unavailable;
   },
   updateLanguage:setLanguage
 });
}
