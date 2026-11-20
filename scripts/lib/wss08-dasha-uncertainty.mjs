/** Research-only Vimshottari envelopes under explicit angular/time margins.
 * Bounds are model assumptions, not calibrated probabilities or event dates.
 * No account, name, storage or network inputs. */
import {vimshottariCandidate} from "./wss04-varga-vimshottari-candidate.mjs";
const WIDTH=360/27;
const norm=x=>((x%360)+360)%360;
export const DASHA_ENVELOPE_STATUS="candidate_dasha_interval_not_event_prediction";
export function dashaUncertaintyCandidate({moonSiderealLongitude,birthUtc,
 birthPrecisionSeconds=60,moonMarginDegrees=.04,yearConvention}={}){
 const ms=Date.parse(birthUtc);
 if(!Number.isFinite(ms)||!Number.isFinite(moonSiderealLongitude)||
    !Number.isInteger(birthPrecisionSeconds)||birthPrecisionSeconds<1||birthPrecisionSeconds>3600||
    !Number.isFinite(moonMarginDegrees)||moonMarginDegrees<.025||moonMarginDegrees>.2)
   throw new RangeError("Explicit supported birth precision and lunar margin required");
 // Conservative lunar motion allowance over the recorded birth interval.
 // 1 degree/hour exceeds normal geocentric lunar longitude motion; this is
 // an assumed envelope, not a formally proved ephemeris error guarantee.
 const margin=moonMarginDegrees+birthPrecisionSeconds/3600;
 const low=moonSiderealLongitude-margin,high=moonSiderealLongitude+margin;
 if(Math.floor(low/WIDTH)!==Math.floor(high/WIDTH))
   return {status:"withheld_lunar_nakshatra_boundary",periods:[],ready_for_prediction:false};
 const variants=[];
 for(const longitude of [low,high])for(const shift of [0,birthPrecisionSeconds])
   variants.push(vimshottariCandidate({moonSiderealLongitude:norm(longitude),
     birthUtc:new Date(ms+shift*1000).toISOString(),yearConvention}));
 const range=values=>({earliest_utc:new Date(Math.min(...values)).toISOString(),
   latest_utc:new Date(Math.max(...values)).toISOString()});
 return {status:DASHA_ENVELOPE_STATUS,ready_for_prediction:false,
   exact_dates_qualified:false,year_convention:yearConvention,
   lunar_margin_degrees:margin,birth_precision_seconds:birthPrecisionSeconds,
   margin_basis:"explicit conservative model assumption, not statistical confidence",
   periods:variants[0].mahadashas.map((period,i)=>({lord:period.lord,
     start:range(variants.map(v=>Date.parse(v.mahadashas[i].start_utc))),
     end:range(variants.map(v=>Date.parse(v.mahadashas[i].end_exclusive_utc))),
     antardashas:period.antardashas.map((a,j)=>({lord:a.lord,
       start:range(variants.map(v=>Date.parse(v.mahadashas[i].antardashas[j].start_utc))),
       end:range(variants.map(v=>Date.parse(v.mahadashas[i].antardashas[j].end_exclusive_utc)))}))
   }))};
}
export function stableDashaContext(envelope,referenceUtc){
 const ms=Date.parse(referenceUtc);
 if(!Number.isFinite(ms))throw new RangeError("Reference instant required");
 if(envelope?.status!==DASHA_ENVELOPE_STATUS)
   return {state:"withheld_period_boundary",major_lord:null,antar_lord:null};
 const contains=p=>Date.parse(p.start.latest_utc)<=ms&&ms<Date.parse(p.end.earliest_utc);
 const major=envelope.periods.find(contains),antar=major?.antardashas.find(contains);
 return {state:major&&antar?"stable_under_assumed_margin":"withheld_period_boundary",
   major_lord:major?.lord??null,antar_lord:antar?.lord??null,
   ready_for_prediction:false};
}
