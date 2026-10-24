import { WORD_CONTRACT, WORD_SCOPE, WORD_TIMEZONE, canonicalPublicationDate, dateScopeKey, inspectWordHistory, internalResult, nonempty, snapshotHash, selectDailyWord } from "./ag70d-word-selection-engine.mjs";
import { executeWordAssignment } from "./ag70d-word-assignment-store.mjs";
import { createWordPostgresAdapter } from "./ag70e-word-postgres-adapter.mjs";
import { projectPublishedWord } from "./ag70e-word-publication-pipeline.mjs";

const eventFor = { reserve:"selection_proposal", authorize:"authorized_assignment", record_publication:"publication" };
async function read(rpc,name,args) {
  const result=await rpc(name,args);
  if(!result || result.error || !Object.hasOwn(result,"data")) throw Error("word_server_read_unavailable");
  return result.data;
}
export async function readWordServerPublication({rpc,timestamp}) {
  const date=canonicalPublicationDate(timestamp);
  const withheld=reason=>({contract_version:"ag70e.word-publication.v1",status:"withheld",reason,date_key:date,
    publication_scope:WORD_SCOPE,timezone:WORD_TIMEZONE,public_output_allowed:false,runtime_activation:false,assignment:null});
  if(!date) return withheld("invalid_timestamp");
  try {
    const snapshot=await read(rpc,"word_assignment_release_snapshot",{p_date:date});
    return projectPublishedWord({...snapshot,date_key:date});
  } catch { return withheld("approved_publication_unavailable"); }
}

// Called only by a trusted worker. All content, policy and decisions come from
// owner-registered DB references, not HTTP request data or checked-in drafts.
export async function runWordServerWorkflow({rpc,timestamp,operation="reserve",enabled=false,scheduled=false}) {
  const date=canonicalPublicationDate(timestamp);
  const withhold=reason=>internalResult("withheld",{reason,date_key:date});
  if(enabled!==true) return withhold("word_server_not_activated");
  if(!date || !Object.hasOwn(eventFor,operation) || typeof rpc!=="function") return withhold("invalid_server_command");
  try {
    const bundle=await read(rpc,"word_assignment_read_workflow",{p_date:date});
    const cfg=bundle.configuration;
    if(cfg?.contract_version!=="ag70e.word-release.v1" || cfg.timezone!==WORD_TIMEZONE || cfg.publication_scope!==WORD_SCOPE ||
      cfg.persistence?.enabled!==true || cfg.runtime_activation!==true || !nonempty(cfg.persistence.server_authorization_ref)) return withhold("server_release_approval_pending");
    if(scheduled && (operation!=="reserve" || cfg.scheduler?.enabled!==true || cfg.scheduler.automatic_publication!==false ||
      !nonempty(cfg.scheduler.approval_ref) || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(cfg.scheduler.local_time))) return withhold("scheduling_not_authorized");
    if(scheduled && Date.parse(timestamp)<Date.parse(date+"T"+cfg.scheduler.local_time+":00+05:30")) return withhold("before_approved_schedule_time");
    if(operation==="record_publication" && (cfg.publication?.review_status!=="approved" || !nonempty(cfg.publication.approval_ref) ||
      cfg.publication.public_output_allowed!==true || cfg.publication.runtime_activation!==true)) return withhold("publication_release_approval_pending");
    const actor=bundle.authorization;
    if(actor?.approval_ref!==cfg.persistence.server_authorization_ref) return withhold("server_authorization_mismatch");
    const capabilities=Object.entries(eventFor).filter(([,type])=>actor.capabilities?.includes(type)).map(([op])=>op);
    const authorization={...actor,capabilities};
    const adapter=createWordPostgresAdapter({rpc,mode:"authorized_server"});
    const history=await adapter.readHistory(), inspected=inspectWordHistory(history);
    if(!inspected.ok) return withhold(inspected.reason);
    const a=inspected.assignments.get(inspected.dates.get(dateScopeKey(date)));
    const input={contract_version:WORD_CONTRACT,date_key:date,timezone:WORD_TIMEZONE,publication_scope:WORD_SCOPE,created_at:timestamp,
      policy:bundle.policy,context:bundle.context,precedence:bundle.precedence,identity_map:bundle.identity_map,bank:bundle.bank,
      exclusions:bundle.exclusions,history,expected_history_ref:history.snapshot_ref};
    const selected=operation==="reserve" ? null : a;
    if(operation==="reserve" && a) return internalResult("replay",{assignment:a.proposal,history_state:a.state});
    if(operation!=="reserve" && !selected) return withhold("assignment_unavailable");
    if(operation==="authorize" && selected.state!=="reservation" || operation==="record_publication" && selected.state!=="authorized_assignment") {
      return internalResult("replay",{assignment:selected.proposal,history_state:selected.state});
    }
    const decisionRef=bundle.decision_refs?.[operation];
    if(operation!=="reserve" && !nonempty(decisionRef)) return withhold("assignment_approval_unavailable");
    const command={contract_version:WORD_CONTRACT,operation,timestamp,
      idempotency_key:"word-server:"+snapshotHash([dateScopeKey(date),operation,decisionRef??null])};
    if(selected) Object.assign(command,{assignment_id:selected.proposal.assignment_id,proposal_id:selected.proposal.proposal_id,
      expected_last_event_id:selected.last_event_id,decision:{review_status:"approved",approval_ref:decisionRef}});
    const selection=operation==="reserve" ? selectDailyWord(input) : null;
    const result=await executeWordAssignment({adapter,authorization,selection_input:input,command});
    // A lost response or race never causes reranking or a second assignment.
    if(result.status==="withheld" || result.status==="reservation_conflict") {
      const latest=await adapter.readHistory(), checked=inspectWordHistory(latest);
      const winning=checked.ok && checked.assignments.get(checked.dates.get(dateScopeKey(date)));
      if(winning && latest.revision>history.revision) return internalResult("replay",{assignment:winning.proposal,history_state:winning.state});
    }
    const remaining=selection?.trace?.filter(t=>t.decision==="eligible").length;
    const alerts=[];
    if(result.status==="withheld") alerts.push({severity:"warning",reason:result.reason});
    if(Number.isSafeInteger(remaining) && Number.isSafeInteger(cfg.scheduler?.low_bank_threshold) && cfg.scheduler.low_bank_threshold>=0 && nonempty(cfg.scheduler.threshold_approval_ref) && remaining<=cfg.scheduler.low_bank_threshold) alerts.push({severity:"warning",reason:"low_unused_bank",remaining});
    return {...result,alerts};
  } catch { return withhold("word_server_operation_unavailable"); }
}
