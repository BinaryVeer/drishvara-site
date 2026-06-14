(function () {
  "use strict";

  var Astronomy = window.Astronomy;
  var card = document.getElementById("panchang-festival-card");
  if (!card || card.getAttribute("data-ag74o-booted") === "true") return;

  window.drishvaraAg74oPublicSurfaceActive = true;
  window.drishvaraAg74iPublicSurfaceActive = true;
  card.setAttribute("data-ag74o-booted", "true");

  var SUPPORTED_START = "1900-01-01";
  var SUPPORTED_END = "2100-12-31";
  var DAY_MS = 86400000;
  var HALF_SECOND_MS = 500;
  var BACKWARD_STEP_MS = 30 * 60 * 1000;
  var BACKWARD_LIMIT_MS = 4 * DAY_MS;
  var TROPICAL_YEAR_DAYS = 365.242189;
  var LAHIRI_J2000_ANCHOR_DEGREES = 23.85675;
  var LAHIRI_RATE_DEGREES_PER_TROPICAL_YEAR = 0.013969;
  var ANNUAL_PATH = "data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json";
  var FESTIVAL_PATH = "data/knowledge-base/panchang-festival/production/ag74n-festival-observance-candidate-bank-samvat-2083.json";

  var LOCATION_MAP = {
    "varanasi-uttar-pradesh-india": { value:"varanasi-uttar-pradesh-india", canonicalId:"varanasi_in", label:"Varanasi / Banaras", timezone:"Asia/Kolkata", latitude:25.3176, longitude:82.9739 },
    "itanagar-arunachal-pradesh-india": { value:"itanagar-arunachal-pradesh-india", canonicalId:"itanagar_in", label:"Itanagar", timezone:"Asia/Kolkata", latitude:27.0844, longitude:93.6053 },
    "new-delhi-delhi-india": { value:"new-delhi-delhi-india", canonicalId:"new_delhi_in", label:"New Delhi", timezone:"Asia/Kolkata", latitude:28.6139, longitude:77.2090 },
    "ranchi-jharkhand-india": { value:"ranchi-jharkhand-india", canonicalId:"ranchi_in", label:"Ranchi", timezone:"Asia/Kolkata", latitude:23.3441, longitude:85.3096 },
    "tokyo-japan": { value:"tokyo-japan", canonicalId:"tokyo_jp", label:"Tokyo", timezone:"Asia/Tokyo", latitude:35.6762, longitude:139.6503 }
  };

  var ALIASES = {
    "varanasi":"varanasi-uttar-pradesh-india",
    "banaras":"varanasi-uttar-pradesh-india",
    "benaras":"varanasi-uttar-pradesh-india",
    "kashi":"varanasi-uttar-pradesh-india",
    "itanagar":"itanagar-arunachal-pradesh-india",
    "new delhi":"new-delhi-delhi-india",
    "delhi":"new-delhi-delhi-india",
    "ranchi":"ranchi-jharkhand-india",
    "tokyo":"tokyo-japan"
  };

  var tithiNames = ["Shukla Pratipada","Shukla Dwitiya","Shukla Tritiya","Shukla Chaturthi","Shukla Panchami","Shukla Shashthi","Shukla Saptami","Shukla Ashtami","Shukla Navami","Shukla Dashami","Shukla Ekadashi","Shukla Dwadashi","Shukla Trayodashi","Shukla Chaturdashi","Purnima","Krishna Pratipada","Krishna Dwitiya","Krishna Tritiya","Krishna Chaturthi","Krishna Panchami","Krishna Shashthi","Krishna Saptami","Krishna Ashtami","Krishna Navami","Krishna Dashami","Krishna Ekadashi","Krishna Dwadashi","Krishna Trayodashi","Krishna Chaturdashi","Amavasya"];
  var nakshatraNames = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
  var yogaNames = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
  var varaNames = [
    { english:"Sunday", sanskrit:"Ravivara" },
    { english:"Monday", sanskrit:"Somavara" },
    { english:"Tuesday", sanskrit:"Mangalavara" },
    { english:"Wednesday", sanskrit:"Budhavara" },
    { english:"Thursday", sanskrit:"Guruvara" },
    { english:"Friday", sanskrit:"Shukravara" },
    { english:"Saturday", sanskrit:"Shanivara" }
  ];

  function karanaName(index) {
    if (index === 1) return "Kimstughna";
    if (index >= 58) return ["Shakuni","Chatushpada","Naga"][index - 58];
    return ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti"][(index - 2) % 7];
  }

  var definitions = {
    tithi: { field:"elongation", kind:"elongation", segment:12, count:30, name:function(i){ return tithiNames[i-1]; } },
    nakshatra: { field:"moonSidereal", kind:"moonSidereal", segment:360/27, count:27, name:function(i){ return nakshatraNames[i-1]; } },
    yoga: { field:"yoga", kind:"yoga", segment:360/27, count:27, name:function(i){ return yogaNames[i-1]; } },
    karana: { field:"elongation", kind:"elongation", segment:6, count:60, name:karanaName }
  };

  var state = {
    dateKey:"",
    bookPage:1,
    requestToken:0,
    activeAbort:null,
    referenceData:null,
    selectedPlaceValue:"varanasi-uttar-pradesh-india"
  };

  function byId(id) { return document.getElementById(id); }
  function setText(id, value) { var el=byId(id); if (el) el.textContent=value; }
  function pad(value, width) { return String(value).padStart(width || 2, "0"); }
  function round(value, digits) { return Number(value.toFixed(digits === undefined ? 6 : digits)); }
  function normalize(value) { return ((value % 360) + 360) % 360; }
  function signedDifference(value, target) { return ((normalize(value)-normalize(target)+540)%360)-180; }
  function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>\"']/g,function(ch){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch];}); }

  function isoToDisplay(value) {
    var match=String(value||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[3]+"/"+match[2]+"/"+match[1] : "";
  }

  function displayToIso(value) {
    var match=String(value||"").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    var day=Number(match[1]), month=Number(match[2]), year=Number(match[3]);
    var probe=new Date(Date.UTC(year,month-1,day,12));
    if (probe.getUTCFullYear()!==year || probe.getUTCMonth()!==month-1 || probe.getUTCDate()!==day) return null;
    return match[3]+"-"+match[2]+"-"+match[1];
  }

  function applyDateMask(value) {
    var digits=String(value||"").replace(/\D/g,"").slice(0,8);
    if (digits.length<=2) return digits;
    if (digits.length<=4) return digits.slice(0,2)+"/"+digits.slice(2);
    return digits.slice(0,2)+"/"+digits.slice(2,4)+"/"+digits.slice(4);
  }

  function shiftDate(dateKey, amount) {
    var p=dateKey.split("-").map(Number);
    var date=new Date(Date.UTC(p[0],p[1]-1,p[2]+amount,12));
    return pad(date.getUTCFullYear(),4)+"-"+pad(date.getUTCMonth()+1)+"-"+pad(date.getUTCDate());
  }

  function todayInTimezone(timezone) {
    var parts={};
    new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).forEach(function(part){parts[part.type]=part.value;});
    return parts.year+"-"+parts.month+"-"+parts.day;
  }

  function validTimezone(timezone) {
    try { new Intl.DateTimeFormat("en",{timeZone:timezone}).format(new Date()); return true; }
    catch (_error) { return false; }
  }

  var formatterCache={};
  function formatter(timezone) {
    if (!formatterCache[timezone]) formatterCache[timezone]=new Intl.DateTimeFormat("en-GB",{timeZone:timezone,calendar:"gregory",numberingSystem:"latn",hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});
    return formatterCache[timezone];
  }

  function zonedParts(ms, timezone) {
    var values={};
    formatter(timezone).formatToParts(new Date(ms)).forEach(function(part){if(part.type!=="literal") values[part.type]=part.value;});
    return {year:Number(values.year),month:Number(values.month),day:Number(values.day),hour:Number(values.hour),minute:Number(values.minute),second:Number(values.second)};
  }

  function localDateKeyAt(ms, timezone) {
    var p=zonedParts(ms,timezone);
    return pad(p.year,4)+"-"+pad(p.month)+"-"+pad(p.day);
  }

  function timezoneOffsetMinutesAt(ms, timezone) {
    var p=zonedParts(ms,timezone);
    var localAsUtc=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
    return Math.round((localAsUtc-Math.floor(ms/1000)*1000)/60000);
  }

  function formatZonedIso(ms, timezone) {
    var p=zonedParts(ms,timezone), offset=timezoneOffsetMinutesAt(ms,timezone), sign=offset>=0?"+":"-", absolute=Math.abs(offset);
    return pad(p.year,4)+"-"+pad(p.month)+"-"+pad(p.day)+"T"+pad(p.hour)+":"+pad(p.minute)+":"+pad(p.second)+sign+pad(Math.floor(absolute/60))+":"+pad(absolute%60);
  }

  function firstUtcAtOrAfterLocalDate(dateKey, timezone) {
    var p=dateKey.split("-").map(Number), approximate=Date.UTC(p[0],p[1]-1,p[2],12), lower=approximate-72*3600000, upper=approximate+72*3600000;
    while(localDateKeyAt(lower,timezone)>=dateKey) lower-=DAY_MS;
    while(localDateKeyAt(upper,timezone)<dateKey) upper+=DAY_MS;
    while(upper-lower>1){var mid=Math.floor((lower+upper)/2);if(localDateKeyAt(mid,timezone)<dateKey)lower=mid;else upper=mid;}
    return upper;
  }

  function civilWindow(dateKey, timezone) {
    var start=firstUtcAtOrAfterLocalDate(dateKey,timezone);
    if (localDateKeyAt(start,timezone)!==dateKey) return {available:false,reason:"nonexistent_local_civil_date"};
    var end=firstUtcAtOrAfterLocalDate(shiftDate(dateKey,1),timezone);
    return {available:end>start,startMs:start,endMs:end,durationHours:round((end-start)/3600000,6)};
  }

  function primitiveState(ms) {
    var time=Astronomy.MakeTime(new Date(ms));
    var sun=Astronomy.SunPosition(time), moon=Astronomy.EclipticGeoMoon(time);
    var ayanamsha=normalize(LAHIRI_J2000_ANCHOR_DEGREES+LAHIRI_RATE_DEGREES_PER_TROPICAL_YEAR*(time.tt/TROPICAL_YEAR_DAYS));
    var sunTropical=normalize(sun.elon), moonTropical=normalize(moon.lon);
    var sunSidereal=normalize(sunTropical-ayanamsha), moonSidereal=normalize(moonTropical-ayanamsha);
    return {sunTropical:sunTropical,moonTropical:moonTropical,sunSidereal:sunSidereal,moonSidereal:moonSidereal,elongation:normalize(moonTropical-sunTropical),yoga:normalize(moonSidereal+sunSidereal)};
  }

  function classify(ms) {
    var raw=primitiveState(ms), elements={};
    Object.keys(definitions).forEach(function(type){var d=definitions[type],index=Math.floor(raw[d.field]/d.segment)+1;elements[type]={index:index,name:d.name(index),angle:raw[d.field]};});
    return {raw:raw,elements:elements};
  }

  function angleFor(kind, ms) {
    var raw=primitiveState(ms);
    if(kind==="elongation")return raw.elongation;
    if(kind==="moonSidereal")return raw.moonSidereal;
    if(kind==="yoga")return raw.yoga;
    throw new Error("Unsupported angle kind");
  }

  function unwrapNear(previous, raw) { var value=normalize(raw);while(value-previous>180)value-=360;while(value-previous< -180)value+=360;return value; }

  function nextBoundary(type, startMs) {
    var d=definitions[type],current=classify(startMs).elements[type].index,target=normalize(current*d.segment),lowerMs=startMs,lowerValue=angleFor(d.kind,lowerMs),targetContinuous=target;
    while(targetContinuous<=lowerValue+1e-10)targetContinuous+=360;
    var upperMs=null,stepMs=3600000,endMs=startMs+5*DAY_MS;
    for(var probe=startMs+stepMs;probe<=endMs;probe+=stepMs){var value=unwrapNear(lowerValue,angleFor(d.kind,probe));if(value>=targetContinuous){upperMs=probe;break;}lowerMs=probe;lowerValue=value;}
    if(upperMs===null)throw new Error("Next transition was not found");
    var loops=0;
    while(upperMs-lowerMs>HALF_SECOND_MS&&loops<100){loops+=1;var mid=Math.floor((lowerMs+upperMs)/2),mv=unwrapNear(lowerValue,angleFor(d.kind,mid));if(mv<targetContinuous){lowerMs=mid;lowerValue=mv;}else upperMs=mid;}
    return {utc:new Date(upperMs).toISOString(),fromIndex:current,toIndex:(current%d.count)+1,residual:Math.abs(signedDifference(angleFor(d.kind,upperMs),target))};
  }

  function previousBoundary(type, startMs) {
    var current=classify(startMs).elements[type].index,upper=startMs,lower=null;
    for(var probe=startMs-BACKWARD_STEP_MS;probe>=startMs-BACKWARD_LIMIT_MS;probe-=BACKWARD_STEP_MS){if(classify(probe).elements[type].index!==current){lower=probe;break;}upper=probe;}
    if(lower===null)throw new Error("Previous transition was not found");
    while(upper-lower>HALF_SECOND_MS){var mid=Math.floor((lower+upper)/2);if(classify(mid).elements[type].index===current)upper=mid;else lower=mid;}
    return {utc:new Date(upper).toISOString(),toIndex:current};
  }

  function sunEvent(windowInfo, observer, timezone, direction) {
    var result=Astronomy.SearchRiseSet(Astronomy.Body.Sun,observer,direction,new Date(windowInfo.startMs-1000),(windowInfo.endMs-windowInfo.startMs+2000)/DAY_MS,0);
    if(!result)return null;
    var ms=result.date.getTime();
    if(ms<windowInfo.startMs||ms>=windowInfo.endMs)return null;
    return {utc:result.date.toISOString(),local:formatZonedIso(ms,timezone)};
  }

  function computeDay(request) {
    if(!Astronomy)throw new Error("Local astronomy library unavailable");
    if(request.dateKey<SUPPORTED_START||request.dateKey>SUPPORTED_END)return {available:false,reason:"Date must be from 01/01/1900 to 31/12/2100."};
    if(!validTimezone(request.timezone))return {available:false,reason:"Enter a valid IANA timezone, for example Asia/Kolkata."};
    if(!Number.isFinite(request.latitude)||request.latitude< -90||request.latitude>90||!Number.isFinite(request.longitude)||request.longitude< -180||request.longitude>180)return {available:false,reason:"Latitude or longitude is outside the supported range."};
    var windowInfo=civilWindow(request.dateKey,request.timezone);
    if(!windowInfo.available)return {available:false,reason:"The selected local civil date does not exist in this timezone."};
    var observer=new Astronomy.Observer(request.latitude,request.longitude,0);
    var sunrise=sunEvent(windowInfo,observer,request.timezone,1),sunset=sunEvent(windowInfo,observer,request.timezone,-1);
    if(!sunrise)return {available:false,reason:"No sunrise occurs within the selected local civil date.",sunset:sunset};
    var sunriseMs=Date.parse(sunrise.utc),current=classify(sunriseMs),transitions={};
    Object.keys(definitions).forEach(function(type){transitions[type]={previous:previousBoundary(type,sunriseMs),next:nextBoundary(type,sunriseMs)};transitions[type].previous.local=formatZonedIso(Date.parse(transitions[type].previous.utc),request.timezone);transitions[type].next.local=formatZonedIso(Date.parse(transitions[type].next.utc),request.timezone);});
    var p=request.dateKey.split("-").map(Number),weekday=new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay();
    return {available:true,sunrise:sunrise,sunset:sunset,vara:varaNames[weekday],paksha:current.elements.tithi.index<=15?"Shukla Paksha":"Krishna Paksha",elements:current.elements,transitions:transitions,window:windowInfo};
  }

  function compactTransition(type, result) {
    var d=definitions[type],previous=result.transitions[type].previous,next=result.transitions[type].next;
    return "Began "+previous.local.replace("T"," ")+" · Next "+next.local.replace("T"," ")+" ("+d.name(next.toIndex)+")";
  }

  function setBusy(busy) {
    card.setAttribute("aria-busy",busy?"true":"false");
    card.setAttribute("data-ag74o-loading",busy?"true":"false");
  }

  function setResultState(name) {
    card.setAttribute("data-ag74o-result-state",name);
    card.setAttribute("data-ag74i-result-state",name==="calculated"?"unique_publicly_approved_record":"governed_unavailable");
  }

  function renderObservance(bank, dateKey) {
    var item=bank&&Array.isArray(bank.candidates)?bank.candidates.find(function(candidate){return candidate.civil_date_candidate===dateKey&&candidate.final_observance_date_approved===true&&candidate.public_output_allowed===true;}):null;
    if(!item){
      setText("upcoming-observance-name","No source-reviewed public observance is approved for this date.");
      setText("upcoming-observance-note","Internal condition candidates are not displayed as festival dates. Public and ritual windows remain unavailable until rule review is complete.");
      setText("upcoming-observance-begins","Not available");
      setText("upcoming-observance-ends","Not available");
      setText("upcoming-observance-ritual-window","Not available");
      return;
    }
    setText("upcoming-observance-name",item.display_name);
    setText("upcoming-observance-note","Source-reviewed public observance");
    setText("upcoming-observance-begins",item.primary_public_window&&item.primary_public_window.start_local||"Not available");
    setText("upcoming-observance-ends",item.primary_public_window&&item.primary_public_window.end_local||"Not available");
    setText("upcoming-observance-ritual-window",item.ritual_window?JSON.stringify(item.ritual_window):"Not available");
  }

  function renderUnavailable(request, reason, focusStatus, bank) {
    setText("panchang-calculation-source","Calculated result unavailable");
    setText("panchang-method-basis","Drishvara Varanasi Standard · local browser calculation");
    setText("panchang-moonrise",request.label+" · "+request.timezone);
    setText("panchang-moonset",isoToDisplay(request.dateKey));
    ["panchang-sunrise","panchang-sunset","panchang-vara","panchang-tithi","panchang-nakshatra","panchang-yoga","panchang-karana","panchang-paksha"].forEach(function(id){setText(id,"Unavailable");});
    ["panchang-tithi-transition","panchang-nakshatra-transition","panchang-yoga-transition","panchang-karana-transition"].forEach(function(id){setText(id,"Unavailable");});
    setText("panchang-selection-status",reason+" No alternate date or location has been substituted.");
    renderObservance(bank,request.dateKey);
    setResultState("governed_unavailable");setBusy(false);
    if(focusStatus&&byId("panchang-selection-status"))byId("panchang-selection-status").focus();
  }

  function renderCalculated(request, result, focusStatus, bank) {
    setText("panchang-calculation-source","Calculated locally in this browser");
    setText("panchang-method-basis","Modern Drik · Lahiri/Chitrapaksha · apparent upper-limb sunrise");
    setText("panchang-moonrise",request.label+" · "+request.timezone);
    setText("panchang-moonset",isoToDisplay(request.dateKey));
    setText("panchang-sunrise",result.sunrise.local.replace("T"," "));
    setText("panchang-sunset",result.sunset?result.sunset.local.replace("T"," "):"No sunset within this civil date");
    setText("panchang-vara",result.vara.english+" · "+result.vara.sanskrit);
    setText("panchang-tithi",result.elements.tithi.name+" ("+result.elements.tithi.index+")");
    setText("panchang-nakshatra",result.elements.nakshatra.name+" ("+result.elements.nakshatra.index+")");
    setText("panchang-yoga",result.elements.yoga.name+" ("+result.elements.yoga.index+")");
    setText("panchang-karana",result.elements.karana.name+" ("+result.elements.karana.index+")");
    setText("panchang-paksha",result.paksha);
    setText("panchang-tithi-transition",compactTransition("tithi",result));
    setText("panchang-nakshatra-transition",compactTransition("nakshatra",result));
    setText("panchang-yoga-transition",compactTransition("yoga",result));
    setText("panchang-karana-transition",compactTransition("karana",result));
    setText("panchang-selection-status","Calculated for "+request.label+" on "+isoToDisplay(request.dateKey)+". Times use "+request.timezone+". No input has been stored.");
    renderObservance(bank,request.dateKey);
    setResultState("calculated");setBusy(false);
    if(focusStatus&&byId("panchang-selection-status"))byId("panchang-selection-status").focus();
  }

  function monthDateRange(instance) {
    if(instance.segments&&instance.segments.length)return instance.segments.map(function(segment){return isoToDisplay(segment.start_civil_date)+"–"+isoToDisplay(segment.end_civil_date);}).join(" · ");
    return isoToDisplay(instance.start_civil_date)+"–"+isoToDisplay(instance.end_civil_date);
  }

  function setBookPage(page) {
    var safe=Math.max(1,Math.min(4,Number(page)||1));state.bookPage=safe;
    document.querySelectorAll("[data-ag74i-book-page]").forEach(function(panel){panel.hidden=Number(panel.getAttribute("data-ag74i-book-page"))!==safe;});
    document.querySelectorAll("[data-ag74i-book-page-button]").forEach(function(button){if(Number(button.getAttribute("data-ag74i-book-page-button"))===safe)button.setAttribute("aria-current","page");else button.removeAttribute("aria-current");});
  }

  function renderBook(calendar, dateKey) {
    if(!calendar||!calendar.annual_book||!Array.isArray(calendar.annual_book.pages)){setText("ag74o-book-status","Annual reference book unavailable.");return;}
    setText("ag74i-calendar-year-label","Vikram Samvat "+calendar.samvat_year+" · "+isoToDisplay(calendar.start_boundary.civil_date)+" to "+isoToDisplay(shiftDate(calendar.end_boundary_exclusive.civil_date,-1)));
    var selectedRecord=Array.isArray(calendar.daily_records)?calendar.daily_records.find(function(record){return record.civil_date===dateKey;}):null,selectedPage=1;
    calendar.annual_book.pages.forEach(function(page){
      var panel=document.querySelector('[data-ag74i-book-page="'+page.page_number+'"]');if(!panel)return;
      var slots=page.slots.map(function(slot){
        if(selectedRecord&&selectedRecord.lunar_month&&slot.canonical_key===selectedRecord.lunar_month.canonical_key)selectedPage=page.page_number;
        var instances=(slot.instances||[]).map(function(instance){var kind=instance.instance_kind==="adhika"?"Adhika":instance.instance_kind==="nija"?"Nija":"Regular";return '<div class="ag74o-month-instance" data-ag74o-instance-kind="'+escapeHtml(instance.instance_kind)+'"><span class="ag74o-instance-kind">'+kind+'</span><span>'+escapeHtml(monthDateRange(instance))+'</span></div>';}).join("");
        if(slot.kshaya_exception)instances='<div class="ag74o-month-instance ag74o-kshaya">Kshaya exception — no physical month fabricated</div>';
        return '<section class="ag74o-month-slot" data-ag74o-book-slot="'+escapeHtml(slot.canonical_key)+'"><div class="ag74o-month-slot-heading"><h5>'+escapeHtml(slot.canonical_name)+'</h5><span>'+escapeHtml(slot.slot_status.replaceAll("_"," "))+'</span></div>'+instances+'</section>';
      }).join("");
      panel.innerHTML='<p class="ag74i-book-page-number">Page '+page.page_number+' of 4</p><h4>Canonical lunar-month slots '+((page.page_number-1)*3+1)+'–'+(page.page_number*3)+'</h4><div class="ag74o-month-slot-grid">'+slots+'</div>';
    });
    if(selectedRecord){setText("ag74o-book-status","Selected Varanasi date belongs to "+selectedRecord.lunar_month.canonical_name+". Page "+selectedPage+" opened automatically.");setBookPage(selectedPage);}else setText("ag74o-book-status","The selected date is outside the generated Vikram Samvat 2083 reference interval. The Varanasi book remains available for direct page navigation.");
  }

  function syncDate(dateKey) {
    state.dateKey=dateKey;
    if(byId("panchang-date-picker"))byId("panchang-date-picker").value=dateKey;
    if(byId("panchang-date-text"))byId("panchang-date-text").value=isoToDisplay(dateKey);
    setText("panchang-selected-date-label",isoToDisplay(dateKey)+" · selected civil date");
  }

  function selectedMode() { var checked=document.querySelector('input[name="ag71c-panchang-location-mode"]:checked');return checked&&checked.value==="coordinates"?"coordinates":"place"; }
  function normalAlias(value){return String(value||"").trim().toLowerCase().replace(/[\s_-]+/g," ");}

  function requestFromUi() {
    if(selectedMode()==="coordinates")return {mode:"coordinates",dateKey:state.dateKey,label:(byId("panchang-coordinate-label")&&byId("panchang-coordinate-label").value.trim())||"Entered coordinates",latitude:Number(byId("panchang-latitude").value),longitude:Number(byId("panchang-longitude").value),timezone:String(byId("panchang-timezone").value||"").trim()};
    var select=byId("panchang-place-select");
    var selectedValue=select&&LOCATION_MAP[select.value]?select.value:state.selectedPlaceValue;
    var alias=normalAlias(byId("panchang-place-alias")&&byId("panchang-place-alias").value),value=alias?ALIASES[alias]:selectedValue;
    if(alias&&!value)return {invalid:true,dateKey:state.dateKey,label:"Entered place alias",timezone:"Timezone unavailable",reason:"This place or alias is not in the governed location list."};
    var place=LOCATION_MAP[value]||LOCATION_MAP["varanasi-uttar-pradesh-india"];
    return {mode:"place",dateKey:state.dateKey,label:place.label,latitude:place.latitude,longitude:place.longitude,timezone:place.timezone,canonicalId:place.canonicalId,value:place.value};
  }

  function loadReferenceData(signal) {
    if(state.referenceData)return Promise.resolve(state.referenceData);
    return Promise.all([
      fetch(ANNUAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Annual book unavailable");return response.json();}),
      fetch(FESTIVAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Festival guard bank unavailable");return response.json();})
    ]).then(function(values){state.referenceData={calendar:values[0],festival:values[1]};return state.referenceData;});
  }

  async function applySelection(options) {
    options=options||{};state.requestToken+=1;var token=state.requestToken;
    if(state.activeAbort)state.activeAbort.abort();state.activeAbort=new AbortController();
    var request=requestFromUi();
    if(request.invalid){renderUnavailable(request,request.reason,options.focusStatus===true,null);return false;}
    setBusy(true);setResultState("loading");setText("panchang-selection-status","Calculating the selected civil date and loading the guarded Varanasi annual book…");
    var result;
    try{result=computeDay(request);}catch(error){result={available:false,reason:String(error&&error.message||error)};}
    try{
      var reference=await loadReferenceData(state.activeAbort.signal);await new Promise(function(resolve){setTimeout(resolve,0);});
      if(token!==state.requestToken)return false;
      renderBook(reference.calendar,request.dateKey);
      if(result.available)renderCalculated(request,result,options.focusStatus===true,reference.festival);else renderUnavailable(request,result.reason,options.focusStatus===true,reference.festival);
      return result.available;
    }catch(error){
      if(error&&error.name==="AbortError")return false;if(token!==state.requestToken)return false;
      if(result.available)renderCalculated(request,result,options.focusStatus===true,null);else renderUnavailable(request,result.reason||"Calculation could not be completed.",options.focusStatus===true,null);
      setText("ag74o-book-status","Annual reference book could not be loaded. Daily calculation remains available.");
      return result.available;
    }
  }

  function choosePlace(value) {
    if(!LOCATION_MAP[value])return false;
    state.selectedPlaceValue=value;
    var select=byId("panchang-place-select");
    if(select){
      select.value=value;
      select.setAttribute("data-ag74o-selected-value",value);
      var safeWrap=select.nextElementSibling&&select.nextElementSibling.matches&&select.nextElementSibling.matches("[data-drishvara-hf12-select]")?select.nextElementSibling:null;
      if(safeWrap){
        var selectedOption=select.options[select.selectedIndex];
        var safeButton=safeWrap.querySelector(".drishvara-hf12-select-button");
        if(safeButton&&selectedOption)safeButton.textContent=selectedOption.textContent.trim();
        safeWrap.querySelectorAll(".drishvara-hf12-select-option").forEach(function(item){item.setAttribute("aria-selected",item.dataset.value===value?"true":"false");});
      }
    }
    document.querySelectorAll('[data-ag71d-r4-select-kind="panchang"]').forEach(function(button){button.setAttribute("aria-pressed",button.getAttribute("data-ag71d-r4-location-value")===value?"true":"false");});
    var summary=document.querySelector('[data-ag71d-r5-selection-summary="panchang"]');if(summary)summary.textContent="Selected Panchang location: "+LOCATION_MAP[value].label;
    card.setAttribute("data-ag74o-selected-place",value);
    return true;
  }

  window.addEventListener("change",function(event){
    if(!event.target||event.target.id!=="panchang-place-select")return;
    event.stopImmediatePropagation();
    choosePlace(event.target.value);
    if(byId("panchang-place-alias"))byId("panchang-place-alias").value="";
    applySelection({focusStatus:true});
  },true);

  document.addEventListener("input",function(event){
    if(event.target&&event.target.id==="panchang-date-text"){
      event.target.value=applyDateMask(event.target.value);
      if(event.target.value.length===10){var parsed=displayToIso(event.target.value);if(parsed){syncDate(parsed);applySelection();}else setText("panchang-selection-status","Enter a valid date in DD/MM/YYYY format.");}
    }
  });

  document.addEventListener("change",function(event){
    if(!event.target)return;
    if(event.target.id==="panchang-date-picker"&&event.target.value){syncDate(event.target.value);applySelection();return;}
    if(event.target.id==="panchang-date-text"){var parsed=displayToIso(event.target.value);if(parsed){syncDate(parsed);applySelection();}return;}
    if(event.target.id==="panchang-place-select"){choosePlace(event.target.value);applySelection();return;}
    if(event.target.id==="panchang-place-alias"){var request=requestFromUi();if(!request.invalid&&request.value)choosePlace(request.value);applySelection({focusStatus:true});return;}
    if(event.target.matches('input[name="ag71c-panchang-location-mode"]')){var surface=document.querySelector('[data-ag71c-coordinate-surface="panchang"]');if(surface)surface.setAttribute("data-ag71d-mode",event.target.value);applySelection();return;}
    if(["panchang-latitude","panchang-longitude","panchang-timezone","panchang-coordinate-label"].includes(event.target.id)&&selectedMode()==="coordinates")applySelection();
  });

  document.addEventListener("keydown",function(event){
    if(event.target&&event.target.id==="panchang-place-alias"&&event.key==="Enter"){event.preventDefault();var request=requestFromUi();if(!request.invalid&&request.value)choosePlace(request.value);applySelection({focusStatus:true});}
    if(event.target&&event.target.matches("[data-ag74i-book-page-button]")&&(event.key==="ArrowLeft"||event.key==="ArrowRight")){event.preventDefault();setBookPage(state.bookPage+(event.key==="ArrowRight"?1:-1));var button=document.querySelector('[data-ag74i-book-page-button="'+state.bookPage+'"]');if(button)button.focus();}
  });

  window.addEventListener("click",function(event){
    var target=event.target&&event.target.closest?event.target:null;if(!target)return;
    function claim(){event.preventDefault();event.stopImmediatePropagation();}
    if(target.closest("#panchang-previous-day")){claim();syncDate(shiftDate(state.dateKey,-1));applySelection({focusStatus:true});return;}
    if(target.closest("#panchang-next-day")){claim();syncDate(shiftDate(state.dateKey,1));applySelection({focusStatus:true});return;}
    if(target.closest("#panchang-today")){claim();var request=requestFromUi();syncDate(todayInTimezone(request.timezone&&validTimezone(request.timezone)?request.timezone:"Asia/Kolkata"));applySelection({focusStatus:true});return;}
    var pageButton=target.closest("[data-ag74i-book-page-button]");if(pageButton){claim();setBookPage(pageButton.getAttribute("data-ag74i-book-page-button"));return;}
    if(target.closest("#ag74i-book-previous")){claim();setBookPage(state.bookPage-1);return;}
    if(target.closest("#ag74i-book-next")){claim();setBookPage(state.bookPage+1);return;}
  },true);

  function boot() {
    if(!Astronomy){renderUnavailable({label:"Varanasi / Banaras",timezone:"Asia/Kolkata",dateKey:todayInTimezone("Asia/Kolkata")},"Local astronomy library did not load.",false,null);return;}
    Astronomy.SetDeltaTFunction(Astronomy.DeltaT_EspenakMeeus);
    choosePlace("varanasi-uttar-pradesh-india");syncDate(todayInTimezone("Asia/Kolkata"));setBookPage(1);applySelection();
  }

  window.drishvaraAg74oApplySelection=applySelection;
  window.drishvaraAg74oSetBookPage=setBookPage;
  window.drishvaraAg74oComputeDay=computeDay;
  window.drishvaraAg74oSyncDate=syncDate;
  window.drishvaraAg74oChoosePlace=choosePlace;
  window.drishvaraAg74oCurrentSelection=function(){var request=requestFromUi(),select=byId("panchang-place-select"),safeWrap=select&&select.nextElementSibling&&select.nextElementSibling.matches&&select.nextElementSibling.matches("[data-drishvara-hf12-select]")?select.nextElementSibling:null,safeSelected=safeWrap?safeWrap.querySelector('.drishvara-hf12-select-option[aria-selected="true"]'):null;return {stateValue:state.selectedPlaceValue,selectValue:select?select.value:null,safeSelectValue:safeSelected?safeSelected.dataset.value:null,safeSelectText:safeSelected?safeSelected.textContent.trim():null,requestValue:request.value||null,requestLabel:request.label||null,resultState:card.getAttribute("data-ag74o-result-state"),locationText:byId("panchang-moonrise")?byId("panchang-moonrise").textContent:null};};
  boot();
})();
