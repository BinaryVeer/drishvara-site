/**
 * WSS08 Supabase provider boundary, STAGING ONLY / NOT ACTIVATED.
 *
 * A subscriber must independently consent to storage. The client must
 * encrypt in-browser BEFORE calling this adapter, and the database must have
 * owner-specific SELECT/INSERT/DELETE RLS. No profile name/DOB/time or
 * encryption passphrase may appear in storage metadata or API calls.
 */
import {validateEncryptedBirthEnvelope} from "./wss08-consented-chart-crypto.mjs";
export const WSS08_CHART_VAULT_TABLE="wss_private_chart_vault";
export const WSS08_CHART_STORAGE_STATUS="staged_not_publicly_activated";

async function authenticatedUser(supabase){
 if(!supabase?.auth||typeof supabase.auth.getUser!=="function"||
    typeof supabase.from!=="function")
   throw new RangeError("An authenticated Supabase client is required");
 const answer=await supabase.auth.getUser();
 if(answer?.error||!answer?.data?.user?.id||
    answer.data.user.is_anonymous===true)
   throw new RangeError("Authenticated, non-anonymous chart owner required");
 const id=answer.data.user.id;
 if(typeof id!=="string"||!/^[a-fA-F0-9-]{36}$/.test(id))
   throw new RangeError("Valid owner account ID required");
 return id;
}
export async function saveEncryptedChartCandidate({
 supabase,envelope,explicitStorageConsent=false,reviewedSecurityGate=false
}={}){
 if(explicitStorageConsent!==true)
   return {status:"storage_consent_required",saved:false};
 if(reviewedSecurityGate!==true)
   return {status:"storage_release_not_authorized",saved:false};
 // Even for the future approved path, validate pure opaque envelope before
 // querying Auth. Never accept raw birth/date/name fields into this adapter.
 const encrypted=validateEncryptedBirthEnvelope(envelope);
 const owner=await authenticatedUser(supabase);
 const row={owner_id:owner,...encrypted};
 const result=await supabase.from(WSS08_CHART_VAULT_TABLE)
   .insert(row).select("id,created_at").single();
 if(result?.error||!result?.data?.id)
   return {status:"save_unconfirmed",saved:false};
 return {status:"opaque_chart_saved",saved:true,id:result.data.id,
   created_at:result.data.created_at};
}
export async function listEncryptedChartsCandidate({
 supabase,reviewedSecurityGate=false
}={}){
 if(reviewedSecurityGate!==true)
   return {status:"storage_release_not_authorized",charts:[]};
 const owner=await authenticatedUser(supabase);
 const result=await supabase.from(WSS08_CHART_VAULT_TABLE)
   .select("id,cipher_version,alg,kdf,kdf_iterations,salt_b64,nonce_b64,encrypted_profile_b64,created_at")
   .eq("owner_id",owner).order("created_at",{ascending:false}).limit(20);
 if(result?.error||!Array.isArray(result?.data))
   return {status:"list_unconfirmed",charts:[]};
 return {status:"encrypted_chart_records",charts:result.data};
}
export async function deleteEncryptedChartCandidate({
 supabase,chartId,explicitDeletionConsent=false,reviewedSecurityGate=false
}={}){
 if(explicitDeletionConsent!==true)
   return {status:"deletion_consent_required",deleted:false};
 if(reviewedSecurityGate!==true)
   return {status:"storage_release_not_authorized",deleted:false};
 if(typeof chartId!=="string"||
    !/^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(chartId))
   throw new RangeError("Valid chart identifier required");
 const owner=await authenticatedUser(supabase);
 const result=await supabase.from(WSS08_CHART_VAULT_TABLE)
   .delete().eq("id",chartId).eq("owner_id",owner).select("id");
 if(result?.error||!Array.isArray(result?.data)||
    result.data.length!==1)
   return {status:"deletion_unconfirmed",deleted:false};
 return {status:"encrypted_chart_deleted",deleted:true};
}
