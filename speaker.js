import {patientStyle,selectDeviceVoice} from './patient-style.js';
/**
 * Safe audio output across mobile and desktop. On-device voices are selected
 * by patient gender when identifiable; never claim a platform can provide
 * voices it has not installed. Optional secure AI-TTS delivers much more
 * expressive speech when the server is configured.
 */
export const AI_SPEECH_START_DEADLINE_MS = 1400;
export class PatientSpeaker {
 constructor({onSpeaking=()=>{},onStatus=()=>{}}={}){
  this.onSpeaking=onSpeaking;this.onStatus=onStatus;
  this.audio=null;this.utterance=null;this.controller=null;this.token=0;
  this.context=null;this.analyser=null;this.samples=null;this.level=0;this.active=false;
  this.aiSpeechSlowUntil=0;
 }
 stop(){
  this.token++;this.controller?.abort();this.controller=null;
  if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load?.();this.audio=null;}
  if(this.utterance){try{speechSynthesis.cancel();}catch{}this.utterance=null;}
  this.analyser=null;this.samples=null;this.level=0;this.active=false;this.onSpeaking(false);
 }
 volume(){
  if(!this.active)return 0;
  if(!this.analyser)return .42;
  this.analyser.getByteTimeDomainData(this.samples);
  let sum=0;for(const v of this.samples){const x=(v-128)/128;sum+=x*x;}
  return Math.min(1,Math.sqrt(sum/this.samples.length)*4.0);
 }
 async speak(text,{patient,endpoint='',preferAI=false,onStart=()=>{},done=()=>{}}={}){
  this.stop();const own=++this.token;
  let started=false;
  const start=()=>{if(own!==this.token||started)return;started=true;this.active=true;this.onSpeaking(true);onStart();};
  const finish=()=>{if(own!==this.token)return;if(!started)onStart();this.active=false;this.level=0;this.onSpeaking(false);done();};
  if(preferAI&&endpoint&&Date.now()>=this.aiSpeechSlowUntil){
   const controller=new AbortController();this.controller=controller;
   // Limit initial AI speech delay. A local voice is faster than leaving the patient silent.
   const wait=setTimeout(()=>controller.abort(),AI_SPEECH_START_DEADLINE_MS);
   try{
    const res=await fetch(endpoint.replace(/\/+$/,'')+'/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId:patient?.id,text:String(text).slice(0,900)}),signal:controller.signal});
    if(!res.ok){const info=await res.json().catch(()=>({}));throw Error(info.error||'Speech service returned '+res.status);}
    const blob=await res.blob();
    clearTimeout(wait);
    if(own!==this.token)return;
    const url=URL.createObjectURL(blob);const audio=new Audio(url);this.audio=audio;
    audio.preload='auto';
    audio.onplaying=start;
    audio.onerror=()=>{URL.revokeObjectURL(url);if(own===this.token){audio.onerror=null;this.browserSpeech(text,patient,finish,own,start);}};
    // WebAudio amplitude follows the actual produced voice where permitted.
    try{
     const AC=window.AudioContext||window.webkitAudioContext;
     if(AC){
      this.context??=new AC();
      const source=this.context.createMediaElementSource(audio);
      this.analyser=this.context.createAnalyser();this.analyser.fftSize=256;
      source.connect(this.analyser);this.analyser.connect(this.context.destination);
      this.samples=new Uint8Array(this.analyser.fftSize);
      this.context.resume().catch(()=>{});
     }
    }catch{this.analyser=null;}
    audio.onended=()=>{URL.revokeObjectURL(url);finish();};
    await audio.play();
    if(own!==this.token)return;
    start();this.onStatus('Gemini AI patient voice playing.');return;
   }catch(error){
    if(own!==this.token)return;
    if(controller.signal.aborted){this.aiSpeechSlowUntil=Date.now()+60000;this.onStatus('Using the quick patient voice to avoid a long delay.');}
    else this.onStatus('Using the device voice while the audio service is unavailable.');
   }finally{clearTimeout(wait);if(this.controller===controller)this.controller=null;}
  }
  if(own===this.token)this.browserSpeech(text,patient,finish,own,start);
 }
 browserSpeech(text,patient,finish,own,start){
  if(!('speechSynthesis' in window)){finish();return;}
  const profile=patientStyle(patient),u=new SpeechSynthesisUtterance(text);
  u.lang='en-GB';u.rate=profile.rate;u.pitch=profile.pitch;u.volume=1;
  // Mobile devices often load their available voices after page load; query
  // on every utterance and use the explicit gender-name preferences.
  const voices=window.speechSynthesis.getVoices(),chosen=selectDeviceVoice(voices,patient);
  if(chosen){u.voice=chosen;u.lang=chosen.lang;}
  u.onstart=start;
  u.onend=finish;u.onerror=finish;
  this.utterance=u;
  try{window.speechSynthesis.speak(u);}catch{finish();}
 }
}
