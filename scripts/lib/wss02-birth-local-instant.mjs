/**
 * Drishvara WSS02 — a pure Gregorian local birth-clock to UTC candidate resolver.
 *
 * This module does NOT calculate Lagna, grahas, Nakshatra, Dasha, or Kundali.
 * Input timezone must already be approved by the WSS02 place resolver.
 * No personal inputs are stored or sent by this module.
 *
 * Repeated local times (DST folds) return all candidates and require explicit
 * selection. Nonexistent local times are rejected; they are never silently
 * shifted. Historic timezone offsets are retained at second resolution.
 *
 * Uses the IANA data embedded in the JS runtime; a future public horoscope
 * kernel MUST pin/record the tzdb runtime/version used for reproducibility.
 */

const formatterCache = new Map();

function supportedZone(timezone) {
  if (typeof timezone !== "string" || !timezone.trim()) return null;
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone.trim(),
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hourCycle: "h23", calendar: "gregory", numberingSystem: "latn"
    });
    formatter.format(new Date("2026-01-01T00:00:00Z"));
    return {timezone:formatter.resolvedOptions().timeZone,formatter};
  }catch{return null;}
}

function getFormatter(tz) {
  if(formatterCache.has(tz))return formatterCache.get(tz);
  const f=supportedZone(tz);
  if(!f)return null;
  formatterCache.set(tz,f.formatter);
  return f.formatter;
}

function localFieldsAtUtc(epochMs,tz) {
  const formatter=getFormatter(tz);
  if(!formatter)throw new RangeError("Unsupported IANA timezone");
  const parts=Object.create(null);
  for(const item of formatter.formatToParts(new Date(epochMs))) {
    if(["year","month","day","hour","minute","second"].includes(item.type)){
      parts[item.type]=Number(item.value);
    }
  }
  return {
    year:parts.year,month:parts.month,day:parts.day,
    hour:parts.hour,minute:parts.minute,second:parts.second
  };
}

function utcEpochFromLocalFields(parts) {
  return Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute,parts.second);
}

function offsetSecondsAtUtc(epochMs,tz) {
  const fields=localFieldsAtUtc(epochMs,tz);
  return Math.round((utcEpochFromLocalFields(fields)-epochMs)/1000);
}

function parseCalendarDate(value) {
  const text=String(value??"");
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if(!m)return null;
  const parts={year:+m[1],month:+m[2],day:+m[3]};
  if(parts.year<1900||parts.year>2100||parts.month<1||parts.month>12||parts.day<1||parts.day>31)return null;
  const ms=Date.UTC(parts.year,parts.month-1,parts.day);
  const date=new Date(ms);
  return date.getUTCFullYear()===parts.year&&date.getUTCMonth()+1===parts.month&&
    date.getUTCDate()===parts.day?parts:null;
}

function parseClock(value) {
  const m=/^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value??""));
  if(!m)return null;
  const hours=+m[1],minutes=+m[2],seconds=m[3]===undefined?0:+m[3];
  if(hours>23||minutes>59||seconds>59)return null;
  return {hour:hours,minute:minutes,second:seconds,accuracySeconds:m[3]===undefined?60:1};
}

function matchesLocal(utcMs,fields,tz){
  const actual=localFieldsAtUtc(utcMs,tz);
  return Object.keys(fields).every(k=>fields[k]===actual[k]);
}

function candidateInstants(fields,tz) {
  const nominalUtc=utcEpochFromLocalFields(fields);
  // Sample the effective timezone on both sides of the local clock to collect
  // all plausible offsets. Sampling resolves even unusual historical changes.
  const offsets=new Set();
  const hour=3600_000;
  for(let delta=-48;delta<=48;delta+=2){
    offsets.add(offsetSecondsAtUtc(nominalUtc+delta*hour,tz));
  }
  const seen=new Set(),candidates=[];
  for(const offset of offsets){
    const epoch=nominalUtc-offset*1000;
    if(!Number.isFinite(epoch)||!matchesLocal(epoch,fields,tz))continue;
    const actualOffset=offsetSecondsAtUtc(epoch,tz);
    if(actualOffset!==offset||seen.has(epoch))continue;
    seen.add(epoch);
    candidates.push({
      utc:new Date(epoch).toISOString(),
      utc_epoch_ms:epoch,
      utc_offset_seconds:actualOffset,
      occurrence:null
    });
  }
  candidates.sort((a,b)=>a.utc_epoch_ms-b.utc_epoch_ms);
  candidates.forEach((c,i)=>c.occurrence=i===0?"earlier":"later");
  return candidates;
}

/**
 * Returns one of:
 * - invalid_date | invalid_time | invalid_timezone
 * - birth_time_unknown
 * - nonexistent_local_time | ambiguous_local_time
 * - birth_instant_resolved
 *
 * Options:
 *  birth_date: YYYY-MM-DD (initial supported envelope 1900-2100)
 *  birth_time: HH:mm[:ss], absent only if time_precision='unknown'
 *  time_precision: 'known' (default) or 'unknown'
 *  timezone: approved IANA identifier
 *  fold: 'earlier' | 'later', required for ambiguous clock times
 *  uncertainty_seconds: optional integer bound for approximate birth time
 */
export function resolveBirthLocalInstant(options={}) {
  const date=parseCalendarDate(options.birth_date);
  if(!date)return {state:"invalid_date",reason:"Valid Gregorian date in 1900–2100 required"};
  const zone=supportedZone(options.timezone);
  if(!zone)return {state:"invalid_timezone",reason:"Approved IANA timezone required"};
  const basis={
    birth_date:options.birth_date,
    timezone:zone.timezone,
    timezone_basis:"platform_IANA_tzdb_unpinned",
    calendar:"proleptic_gregorian",
    chart_readiness:false
  };
  if(options.time_precision==="unknown"){
    return {...basis,state:"birth_time_unknown",reason:"Lagna, houses, Vargas and precise Dashas withheld without exact local birth time"};
  }
  const clock=parseClock(options.birth_time);
  if(!clock)return {...basis,state:"invalid_time",reason:"Local clock must be HH:mm or HH:mm:ss (00:00:00 through 23:59:59)"};
  if(options.time_precision&&options.time_precision!=="known"&&options.time_precision!=="approximate"){
    return {...basis,state:"invalid_time",reason:"Unknown time precision value"};
  }
  const uncertaintySeconds=options.uncertainty_seconds??0;
  if(!Number.isInteger(uncertaintySeconds)||uncertaintySeconds<0||uncertaintySeconds>24*3600)
    return {...basis,state:"invalid_time",reason:"Invalid birth-clock uncertainty bound"};
  const matches=candidateInstants({...date,hour:clock.hour,minute:clock.minute,second:clock.second},zone.timezone);
  if(!matches.length){
    return {...basis,state:"nonexistent_local_time",reason:"Local time did not exist under the timezone's historical clock rules"};
  }
  if(matches.length>1&&options.fold!=="earlier"&&options.fold!=="later"){
    return {...basis,state:"ambiguous_local_time",reason:"Repeated local time; explicitly select earlier or later occurrence",
      choices:matches.map(c=>({occurrence:c.occurrence,utc:c.utc,utc_offset_seconds:c.utc_offset_seconds}))};
  }
  const chosen=matches.length===1?matches[0]:matches.find(c=>c.occurrence===options.fold);
  if(!chosen)return {...basis,state:"invalid_time",reason:"Invalid repeated-time occurrence"};
  const precisionSeconds=Math.max(clock.accuracySeconds,uncertaintySeconds*2||0);
  return {
    ...basis,state:"birth_instant_resolved",
    utc:chosen.utc,utc_epoch_ms:chosen.utc_epoch_ms,
    utc_offset_seconds:chosen.utc_offset_seconds,
    local_time:options.birth_time,
    precision_seconds:precisionSeconds,
    uncertainty_seconds:uncertaintySeconds,
    interval_start_utc:new Date(chosen.utc_epoch_ms-uncertaintySeconds*1000).toISOString(),
    interval_end_exclusive_utc:new Date(chosen.utc_epoch_ms+
      (clock.accuracySeconds+uncertaintySeconds)*1000).toISOString(),
    dst_occurrence:matches.length>1?chosen.occurrence:null,
    chart_readiness:false,
    reason:"Birth instant resolved; full Kundali still requires licensed ephemeris and independent calculation validation"
  };
}
