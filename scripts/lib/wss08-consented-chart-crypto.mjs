/**
 * WSS08 — an in-memory encryption layer for future, consented subscriber charts.
 *
 * No network calls, localStorage, IndexedDB, cookies, or log messages.
 * Encryption runs BEFORE any storage API call. No passphrase or key is stored.
 * Browser WebCrypto AES-256-GCM + PBKDF2/HMAC SHA-256, 600,000 iterations,
 * random 16-byte salt and independent random 12-byte IV per saved record.
 *
 * WARNING: browser-side encryption cannot protect against malicious first-
 * party JavaScript/XSS at the moment a user enters their passphrase. Public
 * activation requires independently audited CSP, dependency and Auth flows.
 */
export const WSS_VAULT_VERSION="drishvara_wss08_chart_v1";
export const WSS_VAULT_KDF_ITERATIONS=600000;
const CONTEXT="Drishvara|WSS08|chart-vault|v1";
const ENCODER=new TextEncoder();
const DECODER=new TextDecoder("utf-8",{fatal:true});
const MAX_CIPHERTEXT=32768;
const DATE=/^(\d{4})-(\d{2})-(\d{2})$/;
const TIME=/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
const COUNTRY=/^[a-zA-Z][a-zA-Z0-9_\-/]{1,149}$/;
const getCrypto=provided=>{
 const provider=provided??globalThis.crypto;
 if(!provider?.subtle||typeof provider.getRandomValues!=="function")
   throw new RangeError("Cryptographically secure browser WebCrypto required");
 return provider;
};
const bytesToBase64=bytes=>{
 let text="";
 for(let i=0;i<bytes.length;i+=8192)
   text+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return btoa(text);
};
const base64ToBytes=(text,min,max)=>{
 if(typeof text!=="string"||text.length<min||text.length>max||
    !/^[a-zA-Z0-9+/]+={0,2}$/.test(text)||text.length%4!==0)
   throw new RangeError("Invalid encrypted payload encoding");
 const raw=atob(text);
 return Uint8Array.from(raw,c=>c.charCodeAt(0));
};
function validatePassphrase(passphrase){
 if(typeof passphrase!=="string"||passphrase.length<14||passphrase.length>256)
   throw new RangeError("A distinct, sufficiently long vault passphrase is required");
 return passphrase;
}
function validateDate(date){
 const m=DATE.exec(date??"");
 if(!m)throw new RangeError("Gregorian birth date YYYY-MM-DD required");
 const d=new Date(date+"T00:00:00.000Z");
 if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date ||
   Number(m[1])<1900||Number(m[1])>2100)
   throw new RangeError("Unsupported birth date");
 return date;
}
function validateStoredProfile(input){
 if(!input||typeof input!=="object"||Array.isArray(input))
   throw new TypeError("An explicit birth profile object is required");
 const name=String(input.name??"").trim().replace(/\s+/gu," ");
 if(!name||name.length>80||/[\u0000-\u001f\u007f]/.test(name))
   throw new RangeError("A normalised display name of 1..80 characters is required");
 const birthDate=validateDate(input.birth_date);
 const time=String(input.birth_time??"");
 if(!TIME.test(time))throw new RangeError("A 24-hour birth clock time is required");
 const place=String(input.approved_birth_place_selector??"");
 if(!COUNTRY.test(place))throw new RangeError("Approved birthplace selector identifier required");
 const language=input.language;
 if(language!=="en"&&language!=="hi")throw new RangeError("Language must be en or hi");
 const p=input.birth_time_precision_seconds;
 if(!Number.isInteger(p)||p<1||p>3600)
   throw new RangeError("Birth-time precision must be 1..3600 seconds");
 if(typeof input.name_sign_consent!=="boolean")
   throw new RangeError("Separate name-sign consent must be explicit");
 if(!["civil_365_25","savana_360"].includes(input.dasha_year_convention))
   throw new RangeError("Explicit Dasha year convention required");
 // Only these fields are retained. E-mail, role, auth or arbitrary user-supplied
 // data is rejected by omission, never bundled into encrypted export.
 return Object.freeze({
   schema_version:1,name,birth_date:birthDate,birth_time:time,
   approved_birth_place_selector:place,
   birth_time_precision_seconds:p,
   language,name_sign_consent:input.name_sign_consent,
   dasha_year_convention:input.dasha_year_convention
 });
}
async function derive(passphrase,salt,cryptoProvider){
 const c=getCrypto(cryptoProvider);
 const key=await c.subtle.importKey("raw",ENCODER.encode(
   validatePassphrase(passphrase)),"PBKDF2",false,["deriveKey"]);
 return c.subtle.deriveKey({
   name:"PBKDF2",salt,iterations:WSS_VAULT_KDF_ITERATIONS,hash:"SHA-256"
 },key,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
function validateEnvelope(blob){
 if(!blob||typeof blob!=="object"||Array.isArray(blob)||
    blob.cipher_version!==WSS_VAULT_VERSION||
    blob.alg!=="AES-256-GCM"||
    blob.kdf!=="PBKDF2-HMAC-SHA256"||
    blob.kdf_iterations!==WSS_VAULT_KDF_ITERATIONS)
   throw new RangeError("Unsupported private chart encryption envelope");
 const salt=base64ToBytes(blob.salt_b64,24,24);
 const nonce=base64ToBytes(blob.nonce_b64,16,16);
 const bytes=base64ToBytes(blob.encrypted_profile_b64,24,MAX_CIPHERTEXT*2);
 if(salt.length!==16||nonce.length!==12||bytes.length<32||bytes.length>MAX_CIPHERTEXT)
   throw new RangeError("Unsupported encrypted chart size or IV");
 return {salt,nonce,bytes};
}
export async function encryptPrivateBirthProfile({profile,passphrase,cryptoProvider}={}){
 const plain=validateStoredProfile(profile);
 const c=getCrypto(cryptoProvider);
 validatePassphrase(passphrase);
 const salt=c.getRandomValues(new Uint8Array(16));
 const nonce=c.getRandomValues(new Uint8Array(12));
 const key=await derive(passphrase,salt,c);
 const plainBytes=ENCODER.encode(JSON.stringify(plain));
 if(plainBytes.length>8192)throw new RangeError("Birth profile data exceeds private vault limits");
 const encrypted=await c.subtle.encrypt({
   name:"AES-GCM",iv:nonce,additionalData:ENCODER.encode(CONTEXT),tagLength:128
 },key,plainBytes);
 const envelope={
   cipher_version:WSS_VAULT_VERSION,
   alg:"AES-256-GCM",kdf:"PBKDF2-HMAC-SHA256",
   kdf_iterations:WSS_VAULT_KDF_ITERATIONS,
   salt_b64:bytesToBase64(salt),nonce_b64:bytesToBase64(nonce),
   encrypted_profile_b64:bytesToBase64(new Uint8Array(encrypted))
 };
 validateEnvelope(envelope);
 return Object.freeze(envelope);
}
export async function decryptPrivateBirthProfile({envelope,passphrase,cryptoProvider}={}){
 const c=getCrypto(cryptoProvider);
 const {salt,nonce,bytes}=validateEnvelope(envelope);
 const key=await derive(passphrase,salt,c);
 let plain;
 try{
   plain=await c.subtle.decrypt({
     name:"AES-GCM",iv:nonce,additionalData:ENCODER.encode(CONTEXT),tagLength:128
   },key,bytes);
 }catch{
   throw new Error("Unable to decrypt chart: invalid passphrase or altered ciphertext");
 }
 const result=JSON.parse(DECODER.decode(plain));
 if(result.schema_version!==1)throw new RangeError("Unsupported decrypted chart version");
 return validateStoredProfile(result);
}
export function validateEncryptedBirthEnvelope(envelope){
 validateEnvelope(envelope);
 return {
   cipher_version:envelope.cipher_version,alg:envelope.alg,kdf:envelope.kdf,
   kdf_iterations:envelope.kdf_iterations,
   salt_b64:envelope.salt_b64,
   nonce_b64:envelope.nonce_b64,
   encrypted_profile_b64:envelope.encrypted_profile_b64
 };
}
