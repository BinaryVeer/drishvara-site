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

  var APPROVED_LOCATION_PATH = "data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json";
  var CALENDAR_ACTIVATION_PATH = "data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json";
  var FESTIVAL_ACTIVATION_PATH = "data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json";
  var DEFAULT_UI_STATE = {
    value:"varanasi-uttar-pradesh-india",
    canonicalId:"varanasi_in",
    label:"Varanasi / Banaras",
    timezone:"Asia/Kolkata",
    latitude:25.3176,
    longitude:82.9739,
    publicSelectionApproved:true,
    computationApproved:true
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
    selectedPlaceValue:"varanasi-uttar-pradesh-india",
    pendingInputDirty:false,
    lastCommittedRequest:null
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
    var button=byId("panchang-calculate");
    if(button){
      button.disabled=Boolean(busy);
      button.setAttribute("aria-busy",busy?"true":"false");
    }
  }

  function setResultState(name) {
    var mapped=name==="calculated"?"unique_publicly_approved_record":name;
    card.setAttribute("data-ag74o-result-state",name);
    card.setAttribute("data-ag74i-result-state",mapped);
  }

  function renderObservance(bank, dateKey) {
    var records=bank&&Array.isArray(bank.records)?bank.records:[];
    var item=records.find(function(record){
      return record.civil_date===dateKey&&record.final_observance_date_approved===true&&record.public_output_allowed===true;
    })||null;
    if(!item){
      setText("upcoming-observance-name","No source-reviewed public observance is approved for this date.");
      setText("upcoming-observance-note","Internal condition candidates are not displayed as festival dates. Public and ritual windows remain unavailable until rule review is complete.");
      setText("upcoming-observance-begins","Not available");
      setText("upcoming-observance-ends","Not available");
      setText("upcoming-observance-ritual-window","Not available");
      return;
    }
    setText("upcoming-observance-name",item.display_name);
    setText("upcoming-observance-note","Source-reviewed public observance · "+(item.location_basis&&item.location_basis.display_label||"Approved location basis"));
    setText("upcoming-observance-begins",item.primary_public_window&&item.primary_public_window.start_local||"Not available");
    setText("upcoming-observance-ends",item.primary_public_window&&item.primary_public_window.end_local||"Not available");
    setText("upcoming-observance-ritual-window",Array.isArray(item.ritual_windows)&&item.ritual_windows.length?JSON.stringify(item.ritual_windows):"Not available");
  }

  function setProvenance(request, decision) {
    decision=decision||{};
    var record=decision.record||request&&request.governedRecord||null;
    var label=request&&request.label?request.label:"Unresolved location";
    var timezone=request&&request.timezone?request.timezone:"No timezone resolved";
    var coordinateText="No coordinate basis";
    if(request&&request.mode==="coordinates"&&Number.isFinite(request.latitude)&&Number.isFinite(request.longitude)){coordinateText=request.latitude+", "+request.longitude+" · user supplied under approved worldwide coordinate policy";}
    else if(record&&Number.isFinite(Number(record.latitude))&&Number.isFinite(Number(record.longitude))){coordinateText=Number(record.latitude)+", "+Number(record.longitude)+" · approved governed projection";}
    setText("panchang-location-provenance",label+(record?" · approved governed basis":" · unresolved input"));
    setText("panchang-coordinate-provenance",coordinateText);
    setText("panchang-timezone-provenance",timezone+(record?" · approved IANA basis":" · not resolved"));
    setText("panchang-approval-provenance",record?"Public selection and computation approved":"Approval not resolved");
  }

  function renderGovernedState(request, stateName, reason, focusStatus, bank, decision) {
    var pending=stateName==="calculation_pending"||stateName==="ui_state_only";
    var invalid=stateName==="invalid_input";
    setText("panchang-calculation-source",pending?"No Panchang computation performed":invalid?"Invalid input — no calculation performed":"Governed result unavailable");
    setText("panchang-method-basis","Approval-aware governed resolver · local engine not invoked");
    setText("panchang-moonrise",(request.label||"Unresolved location")+" · "+(request.timezone||"Timezone unavailable"));
    setText("panchang-moonset",isoToDisplay(request.dateKey));
    var dailyValue=pending?"Pending approval":"Unavailable";
    ["panchang-sunrise","panchang-sunset","panchang-vara","panchang-tithi","panchang-nakshatra","panchang-yoga","panchang-karana","panchang-paksha"].forEach(function(id){setText(id,dailyValue);});
    ["panchang-tithi-transition","panchang-nakshatra-transition","panchang-yoga-transition","panchang-karana-transition"].forEach(function(id){setText(id,dailyValue);});
    setText("panchang-selection-status",reason+" No alternate date, place or timezone has been substituted.");
    setProvenance(request,decision);
    renderObservance(bank,request.dateKey);
    setResultState(stateName);
    setBusy(false);
    if(focusStatus&&byId("panchang-selection-status"))byId("panchang-selection-status").focus();
  }

  function renderUnavailable(request, reason, focusStatus, bank) {
    renderGovernedState(request,"governed_unavailable",reason,focusStatus,bank,null);
  }

  function renderCalculated(request, result, focusStatus, bank) {
    setText("panchang-calculation-source","Calculated locally in this browser");
    setText("panchang-method-basis","AG74P approved local calculation · Modern Drik · Lahiri/Chitrapaksha · apparent upper-limb sunrise");
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
    setProvenance(request,{record:request.governedRecord||null});
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

  function setRequestStatus(message, stateName) {
    setText("panchang-request-status",message);
    var node=byId("panchang-request-status");
    if(node)node.setAttribute("data-ag74o-r3-request-state",stateName||"ready");
    card.setAttribute("data-ag74o-r3-request-state",stateName||"ready");
  }

  function refreshPendingBook() {
    if(state.referenceData&&state.referenceData.calendar){
      renderBook(state.referenceData.calendar,state.dateKey);
    }
  }

  function markRequestPending(message) {
    state.requestToken+=1;
    if(state.activeAbort)state.activeAbort.abort();
    state.activeAbort=null;
    setBusy(false);
    state.pendingInputDirty=true;
    card.setAttribute("data-ag74o-r3-request-dirty","true");
    setRequestStatus(message||"Inputs changed. Press Calculate Panchang to commit this request; the displayed daily result has not been replaced.","input_pending");
    refreshPendingBook();
  }

  function settleCommittedRequest(request, resultState) {
    state.pendingInputDirty=false;
    state.lastCommittedRequest={
      mode:request.mode,
      dateKey:request.dateKey,
      value:request.value||null,
      label:request.label||null,
      timezone:request.timezone||null
    };
    card.setAttribute("data-ag74o-r3-request-dirty","false");
    setRequestStatus("Committed request resolved as "+resultState+" for "+isoToDisplay(request.dateKey)+". Further input changes will remain pending until Calculate Panchang is pressed again.","committed");
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
  function normalAlias(value){return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();}

  var selectorHardeningActive=false;
  var selectorObserver=null;


  function approvedLocationRecords(){return state.referenceData&&state.referenceData.approvedLocations&&Array.isArray(state.referenceData.approvedLocations.records)?state.referenceData.approvedLocations.records:[];}
  function locationRecordByValue(value){return approvedLocationRecords().find(function(record){return record.selector_value===value;})||null;}
  function rebuildSafeSelect(select){
    var safeWrap=select.nextElementSibling&&select.nextElementSibling.matches&&select.nextElementSibling.matches("[data-drishvara-hf12-select]")?select.nextElementSibling:null;if(!safeWrap)return;
    safeWrap.setAttribute("data-open","false");var safeButton=safeWrap.querySelector(".drishvara-hf12-select-button"),menu=safeWrap.querySelector(".drishvara-hf12-select-menu"),selected=select.options[select.selectedIndex];
    if(safeButton){safeButton.textContent=selected?selected.textContent:"Select";safeButton.disabled=false;safeButton.removeAttribute("aria-disabled");safeButton.setAttribute("aria-expanded","false");}
    if(!menu)return;menu.innerHTML="";
    Array.prototype.slice.call(select.options).forEach(function(option){var item=document.createElement("button");item.type="button";item.className="drishvara-hf12-select-option";item.setAttribute("role","option");item.dataset.value=option.value;item.textContent=option.textContent;item.setAttribute("aria-selected",option.selected?"true":"false");item.addEventListener("click",function(){select.value=option.value;select.dispatchEvent(new Event("change",{bubbles:true}));safeWrap.setAttribute("data-open","false");if(safeButton)safeButton.setAttribute("aria-expanded","false");});menu.appendChild(item);});
  }
  function renderApprovedLocationSelector(records){
    if(selectorHardeningActive)return;selectorHardeningActive=true;
    try{var select=byId("panchang-place-select");if(!select)return;var previous=select.value||state.selectedPlaceValue||DEFAULT_UI_STATE.value;select.innerHTML="";
      records.forEach(function(record){var option=document.createElement("option");option.value=record.selector_value;option.textContent=record.display_label;option.setAttribute("data-ag74p-public-approved","true");option.setAttribute("data-ag74p-computation-approved","true");select.appendChild(option);});
      var nextValue=records.some(function(record){return record.selector_value===previous;})?previous:DEFAULT_UI_STATE.value;select.value=nextValue;state.selectedPlaceValue=nextValue;select.disabled=false;select.removeAttribute("aria-disabled");select.setAttribute("data-ag74o-r2-approved-option-count",String(records.length));select.setAttribute("data-ag74o-r2-ui-state-only","false");select.setAttribute("data-ag74p-live","true");rebuildSafeSelect(select);
    }finally{selectorHardeningActive=false;}
  }

  function hardenUiStateSelector() {
    var records=approvedLocationRecords();if(records.length){renderApprovedLocationSelector(records);return;}if(selectorHardeningActive)return;selectorHardeningActive=true;
    try{var select=byId("panchang-place-select");if(!select)return;Array.prototype.slice.call(select.options||[]).forEach(function(option){if(option.value!==DEFAULT_UI_STATE.value)option.remove();});var option=Array.prototype.slice.call(select.options||[]).find(function(item){return item.value===DEFAULT_UI_STATE.value;});if(!option){option=document.createElement("option");option.value=DEFAULT_UI_STATE.value;select.appendChild(option);}option.textContent="Varanasi / Banaras — approved location; press Calculate Panchang";option.selected=true;select.value=DEFAULT_UI_STATE.value;select.disabled=false;select.setAttribute("data-ag74o-r2-approved-option-count","0");select.setAttribute("data-ag74o-r2-ui-state-only","true");rebuildSafeSelect(select);}finally{selectorHardeningActive=false;}
  }

  function installSelectorHardening() {
    var select=byId("panchang-place-select");
    if(!select)return;
    hardenUiStateSelector();
    if(selectorObserver)selectorObserver.disconnect();
    selectorObserver=new MutationObserver(function(){
      window.setTimeout(hardenUiStateSelector,0);
    });
    selectorObserver.observe(select,{childList:true,subtree:false});
    window.setTimeout(hardenUiStateSelector,0);
    window.setTimeout(hardenUiStateSelector,100);
  }

  function requestFromUi() {
    if(selectedMode()==="coordinates")return {mode:"coordinates",dateKey:state.dateKey,label:(byId("panchang-coordinate-label")&&byId("panchang-coordinate-label").value.trim())||"Entered coordinates",latitude:Number(byId("panchang-latitude").value),longitude:Number(byId("panchang-longitude").value),timezone:String(byId("panchang-timezone").value||"").trim()};
    var alias=normalAlias(byId("panchang-place-alias")&&byId("panchang-place-alias").value),select=byId("panchang-place-select"),value=select&&select.value?select.value:state.selectedPlaceValue,record=locationRecordByValue(value)||DEFAULT_UI_STATE;
    return {mode:"place",dateKey:state.dateKey,query:alias,value:value,label:alias?"Entered place alias: "+alias:record.display_label||record.label,latitude:Number(record.latitude),longitude:Number(record.longitude),timezone:record.timezone,canonicalId:record.canonical_place_id||record.canonicalId,uiStateOnly:false};
  }

  function loadReferenceData(signal) {
    if(state.referenceData)return Promise.resolve(state.referenceData);
    return Promise.all([
      fetch(ANNUAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Annual book unavailable");return response.json();}),
      fetch(FESTIVAL_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("Festival source bank unavailable");return response.json();}),
      fetch(APPROVED_LOCATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("AG74P approved-location projection unavailable");return response.json();}),
      fetch(CALENDAR_ACTIVATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("AG74P daily projection unavailable");return response.json();}),
      fetch(FESTIVAL_ACTIVATION_PATH,{cache:"no-store",signal:signal}).then(function(response){if(!response.ok)throw new Error("AG74P festival projection unavailable");return response.json();})
    ]).then(function(values){if(!values[2]||values[2].record_count!==values[2].records.length)throw new Error("AG74P location projection count mismatch");if(!values[3]||values[3].approved_daily_record_count!==values[3].exact_records.length)throw new Error("AG74P daily projection count mismatch");if(!values[4]||values[4].approved_observance_count!==values[4].records.length)throw new Error("AG74P festival projection count mismatch");state.referenceData={calendar:values[0],festivalSource:values[1],approvedLocations:values[2],calendarActivation:values[3],festivalActivation:values[4]};renderApprovedLocationSelector(values[2].records);return state.referenceData;});
  }

  function resolveApprovedGovernedRecord(request, projection) {
    /* ag74p_worldwide_coordinate_local_calculation */
    if(!request.dateKey||request.dateKey<SUPPORTED_START||request.dateKey>SUPPORTED_END)return {state:"invalid_input",reason:"Date must be from 01/01/1900 to 31/12/2100."};
    if(request.mode==="coordinates"){if(!Number.isFinite(request.latitude)||request.latitude< -90||request.latitude>90||!Number.isFinite(request.longitude)||request.longitude< -180||request.longitude>180)return {state:"invalid_input",reason:"Latitude or longitude is outside the supported worldwide range."};if(!request.timezone||!validTimezone(request.timezone))return {state:"invalid_input",reason:"Enter a validated IANA timezone for the supplied coordinates. No timezone will be substituted."};return {state:"approved",record:{canonical_place_id:"coordinate:"+request.latitude.toFixed(6)+","+request.longitude.toFixed(6)+"@"+request.timezone,selector_value:null,display_label:request.label||"Entered coordinates",latitude:request.latitude,longitude:request.longitude,timezone:request.timezone,coordinate_request:true,public_selection_approved:true,computation_approved:true,public_output_allowed:true}};}
    var records=projection&&Array.isArray(projection.records)?projection.records:[];
    if(request.query){var matches=records.filter(function(record){return Array.isArray(record.search_labels)&&record.search_labels.indexOf(request.query)!==-1;});if(matches.length!==1)return {state:"governed_unavailable",reason:matches.length>1?"The place alias is ambiguous and requires governed review.":"This place or alias is not in the publicly approved location projection. Use exact coordinates with a validated IANA timezone; no fallback will be used."};return {state:"approved",record:matches[0]};}
    var record=records.find(function(item){return item.selector_value===request.value;});if(!record)return {state:"governed_unavailable",reason:"The selected named place is not in the approved public projection."};if(record.public_selection_approved!==true||record.computation_approved!==true)return {state:"calculation_pending",reason:"The selected record does not carry all computation approvals."};return {state:"approved",record:record};
  }

  function requestFromApprovedRecord(request, record) {return {mode:record.coordinate_request===true?"coordinates":"place",dateKey:request.dateKey,value:record.selector_value||null,canonicalId:record.canonical_place_id,label:record.display_label,latitude:Number(record.latitude),longitude:Number(record.longitude),timezone:record.timezone,governedRecord:record};}

  function resolveActivatedCalendarRecord(request, projection) {
    var records=projection&&Array.isArray(projection.exact_records)?projection.exact_records:[],matches=records.filter(function(record){return record.civil_date===request.dateKey&&record.canonical_place_id===request.canonicalId&&record.timezone===request.timezone;});
    if(matches.length===1&&matches[0].daily_record_approved===true&&matches[0].public_output_allowed===true)return {state:"approved",record:matches[0]};if(matches.length>1)return {state:"governed_unavailable",reason:"The exact daily projection is not uniquely resolvable."};
    if(request.mode==="coordinates"){var cp=projection&&projection.coordinate_calculation_policy;if(cp&&cp.local_calculation_approved===true&&request.dateKey>=cp.supported_start&&request.dateKey<=cp.supported_end)return {state:"approved",record:{...cp,canonical_place_id:request.canonicalId,timezone:request.timezone}};}
    var policy=projection&&Array.isArray(projection.local_calculation_policies)?projection.local_calculation_policies.find(function(item){return item.canonical_place_id===request.canonicalId&&request.dateKey>=item.supported_start&&request.dateKey<=item.supported_end;}):null;if(policy)return {state:"approved",record:policy};return {state:"calculation_pending",reason:"No exact daily record or approved local-calculation policy covers this request."};
  }

  function transitionDisplay(type, result) {
    var transition=result&&result.transitions&&result.transitions[type];
    if(!transition||!transition.previous||!transition.next||!transition.previous.local||!transition.next.local){
      return "Approved transition detail unavailable";
    }
    return compactTransition(type,result);
  }

  function renderActivatedCalendarRecord(request, activationRecord, focusStatus, bank) {
    var result=activationRecord.runtime_result||{};
    setText("panchang-calculation-source","Approved governed calendar record");
    setText("panchang-method-basis","Approved precomputed record · Modern Drik · Lahiri/Chitrapaksha");
    setText("panchang-moonrise",request.label+" · "+request.timezone);
    setText("panchang-moonset",isoToDisplay(request.dateKey));
    setText("panchang-sunrise",result.sunrise&&result.sunrise.local?result.sunrise.local.replace("T"," "):"Not available");
    setText("panchang-sunset",result.sunset&&result.sunset.local?result.sunset.local.replace("T"," "):"Not available");
    setText("panchang-vara",result.vara?result.vara.english+" · "+result.vara.sanskrit:"Not available");
    setText("panchang-tithi",result.elements&&result.elements.tithi?result.elements.tithi.name+" ("+result.elements.tithi.index+")":"Not available");
    setText("panchang-nakshatra",result.elements&&result.elements.nakshatra?result.elements.nakshatra.name+" ("+result.elements.nakshatra.index+")":"Not available");
    setText("panchang-yoga",result.elements&&result.elements.yoga?result.elements.yoga.name+" ("+result.elements.yoga.index+")":"Not available");
    setText("panchang-karana",result.elements&&result.elements.karana?result.elements.karana.name+" ("+result.elements.karana.index+")":"Not available");
    setText("panchang-paksha",result.paksha||"Not available");
    setText("panchang-tithi-transition",transitionDisplay("tithi",result));
    setText("panchang-nakshatra-transition",transitionDisplay("nakshatra",result));
    setText("panchang-yoga-transition",transitionDisplay("yoga",result));
    setText("panchang-karana-transition",transitionDisplay("karana",result));
    setText("panchang-selection-status","Approved governed calendar record displayed for "+request.label+" on "+isoToDisplay(request.dateKey)+". Times use "+request.timezone+".");
    setProvenance(request,{record:request.governedRecord||null});
    renderObservance(bank,request.dateKey);
    setResultState("calculated");setBusy(false);
    if(focusStatus&&byId("panchang-selection-status"))byId("panchang-selection-status").focus();
  }

  async function applySelection(options) {
    options=options||{};
    state.requestToken+=1;
    var token=state.requestToken;
    if(state.activeAbort)state.activeAbort.abort();
    state.activeAbort=new AbortController();
    var request=requestFromUi();
    setBusy(true);
    setResultState("loading");
    setRequestStatus("Checking the committed request against governed location, calendar and festival activation projections…","loading");
    setText("panchang-selection-status","Checking the governed location, daily-record and approval state…");
    try{
      var reference=await loadReferenceData(state.activeAbort.signal);
      await new Promise(function(resolve){setTimeout(resolve,0);});
      if(token!==state.requestToken)return false;
      renderBook(reference.calendar,request.dateKey);
      var decision=resolveApprovedGovernedRecord(request,reference.approvedLocations);
      if(decision.state!=="approved"){
        renderGovernedState(request,decision.state,decision.reason,options.focusStatus===true,reference.festivalActivation,decision);
        settleCommittedRequest(request,decision.state);
        return false;
      }
      var approvedRequest=requestFromApprovedRecord(request,decision.record);
      var calendarDecision=resolveActivatedCalendarRecord(approvedRequest,reference.calendarActivation);
      if(calendarDecision.state!=="approved"){
        renderGovernedState(approvedRequest,calendarDecision.state,calendarDecision.reason,options.focusStatus===true,reference.festivalActivation,calendarDecision);
        settleCommittedRequest(approvedRequest,calendarDecision.state);
        return false;
      }
      if(calendarDecision.record.output_mode==="approved_precomputed_record"){
        renderActivatedCalendarRecord(approvedRequest,calendarDecision.record,options.focusStatus===true,reference.festivalActivation);
        settleCommittedRequest(approvedRequest,"calculated");
        return true;
      }
      if(calendarDecision.record.output_mode!=="approved_local_calculation"||calendarDecision.record.local_calculation_approved!==true){
        renderGovernedState(approvedRequest,"calculation_pending","The exact daily activation record does not authorise a supported output mode.",options.focusStatus===true,reference.festivalActivation,calendarDecision);
        settleCommittedRequest(approvedRequest,"calculation_pending");
        return false;
      }
      var result;
      try{result=computeDay(approvedRequest);}catch(error){result={available:false,reason:String(error&&error.message||error)};}
      if(result.available)renderCalculated(approvedRequest,result,options.focusStatus===true,reference.festivalActivation);
      else renderUnavailable(approvedRequest,result.reason||"Calculation could not be completed.",options.focusStatus===true,reference.festivalActivation);
      settleCommittedRequest(approvedRequest,result.available?"calculated":"governed_unavailable");
      return Boolean(result.available);
    }catch(error){
      if(error&&error.name==="AbortError")return false;
      if(token!==state.requestToken)return false;
      renderGovernedState(request,"governed_unavailable","The local governed projections or reference data could not be loaded.",options.focusStatus===true,null,null);
      setText("ag74o-book-status","Annual reference book could not be loaded.");
      settleCommittedRequest(request,"governed_unavailable");
      return false;
    }
  }

  function choosePlace(value) {
    var record=locationRecordByValue(value);if(!record&&value===DEFAULT_UI_STATE.value)record=DEFAULT_UI_STATE;if(!record)return false;state.selectedPlaceValue=value;var select=byId("panchang-place-select");
    if(select){select.value=value;select.disabled=false;select.removeAttribute("aria-disabled");select.setAttribute("data-ag74o-selected-value",value);select.setAttribute("data-ag74o-r2-approved-option-count",String(approvedLocationRecords().length));select.setAttribute("data-ag74o-r2-ui-state-only",approvedLocationRecords().length?"false":"true");rebuildSafeSelect(select);}
    document.querySelectorAll('[data-ag71d-r4-select-kind="panchang"]').forEach(function(button){button.setAttribute("aria-pressed","false");button.setAttribute("aria-disabled","true");});var summary=document.querySelector('[data-ag71d-r5-selection-summary="panchang"]');if(summary)summary.textContent="Panchang approved location: "+(record.display_label||record.label)+". Press Calculate Panchang.";card.setAttribute("data-ag74o-selected-place",value);return true;
  }

  window.addEventListener("change",function(event){
    if(!event.target||event.target.id!=="panchang-place-select")return;
    event.stopImmediatePropagation();
    choosePlace(event.target.value);
    if(byId("panchang-place-alias"))byId("panchang-place-alias").value="";
    markRequestPending("Place input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
  },true);

  document.addEventListener("input",function(event){
    if(event.target&&event.target.id==="panchang-date-text"){
      event.target.value=applyDateMask(event.target.value);
      if(event.target.value.length===10){
        var parsed=displayToIso(event.target.value);
        if(parsed){
          syncDate(parsed);
          markRequestPending("Date input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
        }else{
          setRequestStatus("Enter a valid date in DD/MM/YYYY format. The displayed daily result is unchanged.","invalid_pending_input");
        }
      }
    }
  });

  document.addEventListener("change",function(event){
    if(!event.target)return;
    if(event.target.id==="panchang-date-picker"&&event.target.value){
      syncDate(event.target.value);
      markRequestPending("Date input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(event.target.id==="panchang-date-text"){
      var parsed=displayToIso(event.target.value);
      if(parsed){syncDate(parsed);markRequestPending("Date input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");}
      else setRequestStatus("Enter a valid date in DD/MM/YYYY format. The displayed daily result is unchanged.","invalid_pending_input");
      return;
    }
    if(event.target.id==="panchang-place-select"){
      choosePlace(event.target.value);
      markRequestPending("Place input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(event.target.id==="panchang-place-alias"){
      markRequestPending("Place query changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(event.target.matches('input[name="ag71c-panchang-location-mode"]')){
      var surface=document.querySelector('[data-ag71c-coordinate-surface="panchang"]');
      if(surface)surface.setAttribute("data-ag71d-mode",event.target.value);
      markRequestPending("Location mode changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
      return;
    }
    if(["panchang-latitude","panchang-longitude","panchang-timezone","panchang-coordinate-label"].includes(event.target.id)&&selectedMode()==="coordinates"){
      markRequestPending("Coordinate or timezone input changed. Press Calculate Panchang to commit this request; the displayed daily result is unchanged.");
    }
  });

  document.addEventListener("keydown",function(event){
    if(event.target&&event.target.id==="panchang-place-alias"&&event.key==="Enter"){
      event.preventDefault();
      markRequestPending("Place query is ready. Press Calculate Panchang to commit this request; Enter does not auto-calculate.");
      var calculate=byId("panchang-calculate");if(calculate)calculate.focus();
    }
    if(event.target&&event.target.matches("[data-ag74i-book-page-button]")&&(event.key==="ArrowLeft"||event.key==="ArrowRight")){
      event.preventDefault();setBookPage(state.bookPage+(event.key==="ArrowRight"?1:-1));var button=document.querySelector('[data-ag74i-book-page-button="'+state.bookPage+'"]');if(button)button.focus();
    }
  });

  window.addEventListener("click",function(event){
    var target=event.target&&event.target.closest?event.target:null;if(!target)return;
    function claim(){event.preventDefault();event.stopImmediatePropagation();}
    if(target.closest("#panchang-calculate")){claim();applySelection({focusStatus:true});return;}
    if(target.closest("#panchang-previous-day")){claim();syncDate(shiftDate(state.dateKey,-1));markRequestPending("Previous Day selected. Press Calculate Panchang to commit it; the displayed daily result is unchanged.");return;}
    if(target.closest("#panchang-next-day")){claim();syncDate(shiftDate(state.dateKey,1));markRequestPending("Next Day selected. Press Calculate Panchang to commit it; the displayed daily result is unchanged.");return;}
    if(target.closest("#panchang-today")){
      claim();
      var request=requestFromUi();
      var timezone=request.mode==="coordinates"?request.timezone:DEFAULT_UI_STATE.timezone;
      if(!timezone||!validTimezone(timezone)){
        setRequestStatus("A valid IANA timezone is required to determine Today. No timezone was substituted and the displayed daily result is unchanged.","invalid_pending_input");
        return;
      }
      syncDate(todayInTimezone(timezone));
      markRequestPending("Today selected using the stated timezone. Press Calculate Panchang to commit it; the displayed daily result is unchanged.");
      return;
    }
    var pageButton=target.closest("[data-ag74i-book-page-button]");if(pageButton){claim();setBookPage(pageButton.getAttribute("data-ag74i-book-page-button"));return;}
    if(target.closest("#ag74i-book-previous")){claim();setBookPage(state.bookPage-1);return;}
    if(target.closest("#ag74i-book-next")){claim();setBookPage(state.bookPage+1);return;}
  },true);

  function boot() {
    if(Astronomy){Astronomy.SetDeltaTFunction(Astronomy.DeltaT_EspenakMeeus);}installSelectorHardening();choosePlace(DEFAULT_UI_STATE.value);syncDate(todayInTimezone(DEFAULT_UI_STATE.timezone));setBookPage(1);card.setAttribute("data-ag74o-r3-request-dirty","false");card.setAttribute("data-ag74p-public-runtime","ready");
    var request=requestFromUi();renderGovernedState(request,"ui_state_only","Varanasi/today is the approved landing input state. Press Calculate Panchang to commit the request; boot does not auto-calculate.",false,null,{record:DEFAULT_UI_STATE});setRequestStatus("Five named locations and worldwide coordinate calculation are approved. Review inputs, then press Calculate Panchang.","ready");
    state.requestToken+=1;var token=state.requestToken;state.activeAbort=new AbortController();setBusy(true);
    loadReferenceData(state.activeAbort.signal).then(function(reference){if(token!==state.requestToken)return;choosePlace(DEFAULT_UI_STATE.value);renderBook(reference.calendar,state.dateKey);renderObservance(reference.festivalActivation,state.dateKey);setBusy(false);setResultState("ui_state_only");setRequestStatus("Five named locations and worldwide coordinate calculation are approved. Review inputs, then press Calculate Panchang.","ready");}).catch(function(error){if(error&&error.name==="AbortError")return;if(token!==state.requestToken)return;setText("ag74o-book-status","Annual reference book could not be loaded.");setBusy(false);setResultState("ui_state_only");setRequestStatus("Approved release data could not be loaded. No daily result was calculated.","reference_unavailable");});
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){
      window.setTimeout(installSelectorHardening,0);
    },{once:true});
  }else{
    window.setTimeout(installSelectorHardening,0);
  }

  window.drishvaraAg74oApplySelection=applySelection;
  window.drishvaraAg74oMarkRequestPending=markRequestPending;
  window.drishvaraAg74oActivationState=function(){
    var reference=state.referenceData||{};
    return {
      requestDirty:state.pendingInputDirty,
      lastCommittedRequest:state.lastCommittedRequest,
      approvedLocationCount:reference.approvedLocations?reference.approvedLocations.record_count:null,
      approvedDailyRecordCount:reference.calendarActivation?reference.calendarActivation.approved_daily_record_count:null,
      approvedObservanceCount:reference.festivalActivation?reference.festivalActivation.approved_observance_count:null,
       worldwideCoordinatePolicyEnabled:Boolean(reference.approvedLocations&&reference.approvedLocations.worldwide_coordinate_policy&&reference.approvedLocations.worldwide_coordinate_policy.enabled),
       ag74pReleaseId:reference.calendarActivation?reference.calendarActivation.release_id:null
    };
  };
  window.drishvaraAg74oSetBookPage=setBookPage;
  window.drishvaraAg74oComputeDay=computeDay;
  window.drishvaraAg74oSyncDate=syncDate;
  window.drishvaraAg74oChoosePlace=choosePlace;
  window.drishvaraAg74oCurrentSelection=function(){var request=requestFromUi(),select=byId("panchang-place-select"),safeWrap=select&&select.nextElementSibling&&select.nextElementSibling.matches&&select.nextElementSibling.matches("[data-drishvara-hf12-select]")?select.nextElementSibling:null,safeSelected=safeWrap?safeWrap.querySelector('.drishvara-hf12-select-option[aria-selected="true"]'):null;return {stateValue:state.selectedPlaceValue,selectValue:select?select.value:null,safeSelectValue:safeSelected?safeSelected.dataset.value:null,safeSelectText:safeSelected?safeSelected.textContent.trim():null,requestValue:request.value||null,requestLabel:request.label||null,resultState:card.getAttribute("data-ag74o-result-state"),locationText:byId("panchang-moonrise")?byId("panchang-moonrise").textContent:null};};
  boot();
})();
