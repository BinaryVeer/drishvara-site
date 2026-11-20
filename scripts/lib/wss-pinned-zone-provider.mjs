/** Frozen civil offsets for the approved-place natal candidate, independent
 * of browser Intl/ICU. No location approvals are granted by this provider. */
import {TIMEZONE_DATA_VERSION,TIMEZONE_TRANSITIONS} from "./wss-pinned-timezone-data.mjs";
export {TIMEZONE_DATA_VERSION};
export function supportedPinnedTimezone(timezone){
 if(typeof timezone!=="string")return null;
 const key=timezone.trim();
 return Object.hasOwn(TIMEZONE_TRANSITIONS,key)?key:null;
}
export function pinnedOffsetSeconds(epochMs,timezone){
 const key=supportedPinnedTimezone(timezone),sec=Math.floor(epochMs/1000);
 if(!key||!Number.isFinite(epochMs)||
    sec<TIMEZONE_DATA_VERSION.start_inclusive_utc_seconds||
    sec>=TIMEZONE_DATA_VERSION.end_exclusive_utc_seconds)
   throw new RangeError("Outside pinned timezone or supported UTC envelope");
 const rows=TIMEZONE_TRANSITIONS[key];
 let lo=0,hi=rows.length;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(rows[mid][0]<=sec)lo=mid;else hi=mid;}
 return rows[lo][1];
}
export function pinnedLocalFields(epochMs,timezone){
 const offset=pinnedOffsetSeconds(epochMs,timezone);
 const d=new Date(epochMs+offset*1000);
 return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),
   hour:d.getUTCHours(),minute:d.getUTCMinutes(),second:d.getUTCSeconds()};
}
