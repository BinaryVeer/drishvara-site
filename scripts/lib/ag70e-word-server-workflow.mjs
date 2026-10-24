import { WORD_CONTRACT, WORD_SCOPE, WORD_TIMEZONE, canonicalPublicationDate, dateScopeKey, inspectWordHistory, internalResult, nonempty, snapshotHash, selectDailyWord, validCivilDate, validApprovedRecord } from "./ag70d-word-selection-engine.mjs";
import { executeWordAssignment } from "./ag70d-word-assignment-store.mjs";
import { createWordPostgresAdapter } from "./ag70e-word-postgres-adapter.mjs";
import { projectPublishedWord, reviewedWordCopy } from "./ag70e-word-publication-pipeline.mjs";

const eventFor = { reserve:"selection_proposal", authorize:"authorized_assignment", record_publication:"publication" };
function selectionInput(bundle, history, date, timestamp) {
  return {contract_version:WORD_CONTRACT,date_key:date,timezone:WORD_TIMEZONE,publication_scope:WORD_SCOPE,created_at:timestamp,
    policy:bundle.policy,context:bundle.context,precedence:bundle.precedence,identity_map:bundle.identity_map,bank:bundle.bank,
    exclusions:bundle.exclusions,history,expected_history_ref:history.snapshot_ref};
}
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
export async function runWordServerWorkflow({rpc,timestamp,operation="reserve",enabled=false,scheduled=false,standing=false}) {
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
    const input=selectionInput(bundle,history,date,timestamp);
    const selected=operation==="reserve" ? null : a;
    if(operation==="reserve" && a) return internalResult("replay",{assignment:a.proposal,history_state:a.state});
    if(operation!=="reserve" && !selected) return withhold("assignment_unavailable");
    if(operation==="authorize" && selected.state!=="reservation" || operation==="record_publication" && selected.state!=="authorized_assignment") {
      return internalResult("replay",{assignment:selected.proposal,history_state:selected.state});
    }
    const derived=standing && operation!=="reserve" ? await read(rpc,"word_assignment_standing_decision",{p_date:date,p_operation:operation}) : null;
    if(standing && derived && derived.policy_ref!==cfg.standing_authorization?.policy_ref) return withhold("standing_policy_mismatch");
    const decisionRef=standing ? derived?.decision_ref : bundle.decision_refs?.[operation];
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

export function validWordStandingPolicy(policy,date,ref) {
  const rules=["global_ist_civil_date","unused_approved_eligible_first","withhold_on_exhaustion","standing_routine_publication","requires_all_individual_approvals"];
  return Boolean(policy?.contract_version==="ag70e.word-publisher-policy.v1" && policy.review_status==="approved" &&
    nonempty(policy.policy_id) && nonempty(policy.version) && nonempty(policy.approval_ref) && nonempty(policy.decision_authority) &&
    policy.record_ref===ref && ref===policy.policy_id+"@"+policy.version &&
    policy.publication_scope===WORD_SCOPE && policy.timezone===WORD_TIMEZONE &&
    validCivilDate(date) && validCivilDate(policy.decision_date) && policy.decision_date<=date &&
    validCivilDate(policy.valid_from) && policy.valid_from<=date &&
    (policy.expires_on===null || validCivilDate(policy.expires_on) && policy.expires_on>=date) &&
    policy.revoked===false && policy.superseded_by===null && policy.rules &&
    Object.keys(policy.rules).length===rules.length && rules.every(key=>policy.rules[key]===true));
}

// Standing policy supplies routine transition decisions, never content approval.
// The database rechecks the registered policy at decision, commit and export time.
export async function runWordDailyPublication({rpc,timestamp,enabled=false,scheduled=false}) {
  const date=canonicalPublicationDate(timestamp), withhold=reason=>internalResult("withheld",{reason,date_key:date});
  if(enabled!==true) return withhold("word_server_not_activated");
  if(!date || typeof rpc!=="function") return withhold("invalid_server_command");
  try {
    const inspected=await read(rpc,"word_assignment_standing_decision",{p_date:date,p_operation:"inspect"});
    const cfg=inspected.configuration, policy=inspected.policy, ref=inspected.policy_ref;
    if(!validWordStandingPolicy(policy,date,ref) || cfg?.standing_authorization?.enabled!==true ||
      cfg.standing_authorization.policy_ref!==ref || !nonempty(cfg.standing_authorization.production_approval_ref)) return withhold("standing_policy_unavailable");
    if(scheduled && (cfg.scheduler?.enabled!==true || cfg.scheduler.automatic_publication!==true ||
      !nonempty(cfg.scheduler.approval_ref) || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(cfg.scheduler.local_time))) return withhold("scheduling_not_authorized");
    if(scheduled && Date.parse(timestamp)<Date.parse(date+"T"+cfg.scheduler.local_time+":00+05:30")) return withhold("before_approved_schedule_time");
    const bundle=await read(rpc,"word_assignment_read_workflow",{p_date:date});
    const history=await createWordPostgresAdapter({rpc,mode:"authorized_server"}).readHistory();
    const selection=selectDailyWord(selectionInput(bundle,history,date,timestamp));
    const record=(selection.proposal??selection.assignment)?.snapshot?.approved_record_snapshot;
    if(!["proposal","replay"].includes(selection.status)) return withhold(selection.reason??"approved_bank_unavailable");
    if(!validApprovedRecord(record) || record.revoked===true || record.withdrawn===true || record.superseded===true ||
      !reviewedWordCopy(record.reviewed_publication_copy)) return withhold("publication_copy_unapproved");
    for(const operation of ["reserve","authorize","record_publication"]) {
      const result=await runWordServerWorkflow({rpc,timestamp,operation,enabled:true,standing:true});
      if(!["committed","idempotent_replay","replay","reservation_conflict"].includes(result.status)) return withhold(result.reason??"standing_transition_unavailable");
    }
    const released=await read(rpc,"word_assignment_standing_decision",{p_date:date,p_operation:"release"});
    if(released.policy_ref!==ref || released.policy_version!==policy.version || !nonempty(released.publication_event_id)) return withhold("standing_policy_mismatch");
    if((await readWordServerPublication({rpc,timestamp})).status!=="published") return withhold("approved_publication_unavailable");
    return internalResult("completed",{date_key:date,publisher_policy_ref:ref,publisher_policy_version:policy.version,publication_event_id:released.publication_event_id});
  } catch { return withhold("standing_publication_unavailable"); }
}
