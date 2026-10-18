/**
 * Keep patient conversations responsive when an optional AI service is slow.
 * The deadline includes both the network request and JSON body parsing.
 * Aborting avoids playing a stale response after the local fallback has begun.
 */
export const PATIENT_REPLY_DEADLINE_MS = 5200;
export async function requestPatientReply(fetcher,url,options,deadlineMs=PATIENT_REPLY_DEADLINE_MS){
 const controller=new AbortController();
 let timer;
 const request=(async()=>{
  const response=await fetcher(url,{...options,signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  return {response,data};
 })();
 const deadline=new Promise((_,reject)=>{
  timer=setTimeout(()=>{
   controller.abort();
   reject(new Error('Patient reply deadline exceeded'));
  },deadlineMs);
 });
 try{return await Promise.race([request,deadline]);}
 finally{clearTimeout(timer);}
}
