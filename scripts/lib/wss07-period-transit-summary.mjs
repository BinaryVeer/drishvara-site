/**
 * WSS06/WSS07: current month/year observational transit summaries.
 * Date sampling at reference-location local noon only; "changes" are not
 * exact ingress times. No person's name is accepted, transmitted or stored.
 */
import {periodTransitCandidate} from "./wss05-06-context-and-transits-candidate.mjs";
import {WSS04_STATUS} from "./wss04-varga-vimshottari-candidate.mjs";
export const PERIOD_STATUS="wss06_month_year_computed_summary_not_prediction";
const keyDate=value=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||"")))throw new RangeError("Reference YYYY-MM-DD required");
 const d=new Date(value+"T00:00:00.000Z");
 if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)throw new RangeError("Invalid date");
 return d;
};
function spanFor(date,period){
 const y=date.getUTCFullYear(),month=date.getUTCMonth();
 if(period==="month"){
  return {start:new Date(Date.UTC(y,month,1)).toISOString().slice(0,10),
    end:new Date(Date.UTC(y,month+1,0)).toISOString().slice(0,10)};
 }
 if(period==="year"){
  return {start:y+"-01-01",end:y+"-12-31"};
 }
 throw new RangeError("Month or year required");
}
export function computedPeriodSummaryCandidate({
 report,period="month",referenceDate,timezone,latitude,longitude
}={}) {
 if(!report||report.status!=="candidate_chart_report_not_approved_for_user_prediction"||
   report.ready_for_public_display!==false)throw new RangeError("Non-public WSS07 report required");
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||
    Math.abs(latitude)>65||Math.abs(longitude)>180)
   return {status:"unavailable_reference_geography",ready_for_prediction:false};
 const day=keyDate(referenceDate);
 const {start,end}=spanFor(day,period);
 const natal={
   status:"not_approved_for_public_prediction_or_kundali",
   grahas:report.charts.D1.grahas
 };
 const dasha={
   status:WSS04_STATUS,
   mahadashas:report.astronomical_birth_context.mahadashas,
   year_convention:report.basis.dasha_year_convention
 };
 const result=periodTransitCandidate({
   startDate:start,endDate:end,timezone,latitude,longitude,natal,dasha
 });
 if(result.status!=="wss05_06_candidate_structured_context_not_prediction")
   return {status:"unavailable_period",reason:result.status,ready_for_prediction:false};
 return {
   status:PERIOD_STATUS,ready_for_prediction:false,
   period,timezone,start_date:start,end_date:end,
   sample_count:result.reference_period.dayCount,
   observation_method:"one_local_noon_sidereal_snapshot_per_day",
   sign_changes:result.observed_sign_changes,
   dasha_changes:result.observed_dasha_changes,
   exact_ingresses_calculated:false,
   interpretation_rule_bank_approved:false,
   note:"Observed between local-noon samples; traditional implications not yet source-approved. These dates are not exact ingresses or personal predictions."
 };
}
