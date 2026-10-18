import {patientStyle,selectDeviceVoice} from './patient-style.js';
/**
 * Safe audio output across mobile and desktop. On-device voices are selected
 * by patient gender when identifiable; never claim a platform can provide
 * voices it has not installed. Optional secure AI-TTS delivers much more
 * expressive speech when the server is configured.
 */
export class PatientSpeaker {
 constructor({onSpeaking=()=>{},onStatus=()=>{}}={}){
  this.onSpeaking=onSpeaking;this.onStatus=onStatus;
  this.audio=null;this.utterance=null;this.controller=null;this.token=0;
  this.context=null;this.analyser=null;this.samples=null;this.level=0;this.active=false;
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
 async speak(text,{patient,endpoint='',preferAI=false,done=()=>{}}={}){
  this.stop();const own=++this.token;
  const finish=()=>{if(own!==this.token)return;this.active=false;this.level=0;this.onSpeaking(false);done();};
  if(preferAI&&endpoint){
   try{
    this.controller=new AbortController();
    const res=await fetch(endpoint.replace(/\/+$/,'')+'/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId:patient?.id,text:String(text).slice(0,900)}),signal:this.controller.signal});
    if(!res.ok){const info=await res.json().catch(()=>({}));throw Error(info.error||'Speech service returned '+res.status);}
    const blob=await res.blob();
    if(own!==this.token)return;
    const url=URL.createObjectURL(blob);const audio=new Audio(url);this.audio=audio;
    audio.preload='auto';audio.onended=finish;audio.onerror=()=>{URL.revokeObjectURL(url);if(own===this.token)this.browserSpeech(text,patient,finish,own);};
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
    this.active=true;this.onSpeaking(true);this.onStatus('Gemini AI patient voice playing.');return;
   }catch(error){
    if(own!==this.token)return;
    if(error?.name!=='AbortError')this.onStatus('Gemini speech unavailable ('+String(error?.message||'request failed').slice(0,110)+'). Using device voice.');
   }
  }
  if(own===this.token)this.browserSpeech(text,patient,finish,own);
 }
 browserSpeech(text,patient,finish,own){
  if(!('speechSynthesis' in window)){finish();return;}
  const profile=patientStyle(patient),u=new SpeechSynthesisUtterance(text);
  u.lang='en-GB';u.rate=profile.rate;u.pitch=profile.pitch;u.volume=1;
  // Mobile devices often load their available voices after page load; query
  // on every utterance and use the explicit gender-name preferences.
  const voices=window.speechSynthesis.getVoices(),chosen=selectDeviceVoice(voices,patient);
  if(chosen){u.voice=chosen;u.lang=chosen.lang;}
  u.onstart=()=>{if(own!==this.token)return;this.active=true;this.onSpeaking(true);};
  u.onend=finish;u.onerror=finish;
  this.utterance=u;
  try{window.speechSynthesis.speak(u);}catch{finish();}
 }
}
