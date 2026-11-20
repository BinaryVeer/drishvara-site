import {WSS08_PRECISION_STATE} from "./wss08-natal-precision-audit.mjs";

export function assertChartPrecisionAudit(audit,report){
 if(!audit||audit.status!==WSS08_PRECISION_STATE||
    audit.ready_for_public_chart!==false||
    audit.ready_for_dasha_dates!==false||
    audit.ready_for_public_predictions!==false)
    throw new RangeError("A fail-closed WSS08 precision audit is mandatory");
 // A precision audit for *another birth instant or place* must never
 // authorize even a provisional sign, Navamsa, Dasha or chart label.
 const basis=audit.audit_basis, chart=report?.basis;
 if(!basis||!chart||!chart.geographic_basis||
    !Number.isFinite(basis.birth_latitude)||
    !Number.isFinite(basis.birth_longitude)||
    !Number.isInteger(basis.birth_time_precision_seconds)||
    basis.birth_time_precision_seconds<1||
    basis.birth_instant_utc!==chart.birth_instant_utc||
    basis.birth_timezone!==chart.timezone||
    basis.timezone_data_version!==chart.timezone_data_version||
    basis.timezone_source_sha256!==chart.timezone_source_sha256||
    basis.birth_latitude!==chart.geographic_basis.latitude||
    basis.birth_longitude!==chart.geographic_basis.longitude||
    audit.utc_start!==chart.birth_instant_utc||
    audit.birth_time_span_seconds!==basis.birth_time_precision_seconds||
    !Number.isInteger(chart.birth_time_precision_seconds)||
    chart.birth_time_precision_seconds<1||
    basis.birth_time_precision_seconds<chart.birth_time_precision_seconds||
    Date.parse(audit.utc_end_exclusive)!==Date.parse(audit.utc_start)+
      basis.birth_time_precision_seconds*1000)
   throw new RangeError("Precision audit does not match the displayed birth-chart basis");
 const requiredGrahas=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Rahu","Ketu"];
 if(!Array.isArray(audit.grahas)||audit.grahas.length!==9||
    !requiredGrahas.every(name=>audit.grahas.filter(g=>g.graha===name).length===1)||
    !Number.isInteger(audit.samples_checked)||audit.samples_checked<9||
    !["D1","D9","D10"].every(k=>audit[k]&&typeof audit[k].state==="string"))
   throw new RangeError("Incomplete chart precision audit");
}
