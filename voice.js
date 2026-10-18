import {PatientSpeaker} from './speaker.js';
/* Live audio controller. No API keys are stored or accepted in the browser. */
export class VoiceRoom {
 constructor({onStatus,onCandidate,onPatient,onSpeaking=()=>{},speaker=null}){
  this.onStatus=onStatus;this.onCandidate=onCandidate;this.onPatient=onPatient;this.onSpeaking=onSpeaking;
  this.speaker=speaker||new PatientSpeaker({onSpeaking,onStatus});this.ownSpeaker=!speaker;this.caseRecord=null;
  this.mode=null;this.pc=null;this.dc=null;this.stream=null;this.audio=null;
  this.recognition=null;this.speech=null;this.active=false;this.reply=null;this.busy=false;
 }
 status(message){this.onStatus(message);}
 async connectAI(endpoint,caseId){
  this.stop();
  if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)throw Error('A microphone and WebRTC-capable HTTPS browser are required.');
  this.mode='ai';this.active=true;this.status('Connecting to your simulated patient…');
  try{
   const response=await fetch(endpoint.replace(/\/+$/,'')+'/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.value)throw Error(data.error||'Voice service not configured.');
   if(!this.active)throw Error('Connection cancelled.');
   const pc=new RTCPeerConnection();this.pc=pc;
   const audio=document.createElement('audio');audio.autoplay=true;audio.setAttribute('playsinline','');this.audio=audio;
   pc.ontrack=e=>{audio.srcObject=e.streams[0];audio.play().catch(()=>this.status('Tap the screen to allow patient audio playback.'));};
   this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   if(!this.active)throw Error('Connection cancelled.');
   pc.addTrack(this.stream.getAudioTracks()[0],this.stream);
   const dc=pc.createDataChannel('oai-events');this.dc=dc;
   dc.onopen=()=>{this.status('Live AI patient connected. Speak naturally; you can interrupt.');this.send({type:'response.create',response:{instructions:'Begin by addressing the doctor naturally with your opening complaint in one short sentence.'}});};
   dc.onclose=()=>{if(this.active)this.status('Patient audio connection ended. Reconnect to resume.');};
   dc.onmessage=e=>{
    if(!this.active)return;
    let event;try{event=JSON.parse(e.data);}catch{return;}
    if(event.type==='conversation.item.input_audio_transcription.completed'&&event.transcript?.trim())this.onCandidate(event.transcript.trim());
    if(['response.output_audio_transcript.done','response.audio_transcript.done'].includes(event.type)&&event.transcript?.trim())this.onPatient(event.transcript.trim());
    if(event.type==='response.created')this.onSpeaking(true);
    if(event.type==='response.done'||event.type==='response.cancelled')this.onSpeaking(false);
    if(event.type==='error')this.status(event.error?.message||'Voice service error. You can reconnect.');
   };
   const offer=await pc.createOffer();await pc.setLocalDescription(offer);
   const answer=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:'Bearer '+data.value,'Content-Type':'application/sdp'},body:offer.sdp});
   if(!answer.ok)throw Error('Audio connection rejected ('+answer.status+').');
   if(!this.active)throw Error('Connection cancelled.');
   await pc.setRemoteDescription({type:'answer',sdp:await answer.text()});
   this.status('Microphone connected. Talk to the patient naturally.');
  }catch(error){this.stop();throw error;}
 }
 async connectBrowser(caseRecord,answer){
  this.stop();
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R||!('speechSynthesis' in window))throw Error('Hands-free browser speech is unavailable here. Try Chrome or Edge, or type your questions.');
  this.mode='browser';this.caseRecord=caseRecord;this.reply=answer;this.active=true;
  this.status('Browser microphone ready. Patient responses may use Gemini if configured.');
  this.say(caseRecord.opening,()=>this.listen());
 }
 say(text,done){
  if(!this.active)return;
  // The same female/male voice profile is used for typed and microphone
  // conversations. Do not restart recognition until speech has finished.
  this.speaker.speak(text,{patient:this.caseRecord,done:()=>{if(this.active)done?.();}});
 }
  listen(){
  if(!this.active||this.mode!=='browser')return;
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  const recognition=new R();this.recognition=recognition;
  recognition.lang='en-GB';recognition.interimResults=false;recognition.maxAlternatives=1;
  recognition.onresult=async e=>{
   if(!this.active)return;
   const text=e.results?.[0]?.[0]?.transcript?.trim();if(!text)return;
   this.busy=true;this.onCandidate(text);this.status('Patient considering your question…');
   let result;try{result=await this.reply(text);}catch{result='Sorry, could you repeat that, doctor?';}
   if(!this.active)return;
   this.onPatient(result);
   this.say(result,()=>{this.busy=false;this.listen();});
  };
  recognition.onerror=e=>{if(!this.active)return;if(['not-allowed','service-not-allowed'].includes(e.error)){this.status('Microphone permission denied. Use text instead.');this.stop();}else this.status('Speech recognition: '+e.error+'. Try again if listening stops.');};
  recognition.onend=()=>{if(!this.active)return;/* Restart after silence, but not while the patient is speaking. */if(!this.busy&&!window.speechSynthesis.speaking)setTimeout(()=>{if(this.active&&this.recognition===recognition)this.listen();},400);};
  try{recognition.start();this.status('Listening — speak to your patient.');}catch{this.status('Unable to start listening; use text or reconnect.');}
 }
 send(event){if(this.dc?.readyState==='open')this.dc.send(JSON.stringify(event));}
 sendText(text){
  if(!this.active||this.mode!=='ai'||this.dc?.readyState!=='open')return false;
  this.send({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text}]}});
  this.send({type:'response.create'});return true;
 }
 stop(){
  this.active=false;this.mode=null;this.busy=false;
  if(this.recognition){const r=this.recognition;this.recognition=null;r.onend=null;r.onresult=null;try{r.abort();}catch{}}
  try{window.speechSynthesis?.cancel();}catch{}
  try{this.dc?.close();}catch{}this.dc=null;
  try{this.pc?.close();}catch{}this.pc=null;
  try{this.stream?.getTracks().forEach(t=>t.stop());}catch{}this.stream=null;
  this.speaker.stop();
  this.onSpeaking(false);
  if(this.audio){this.audio.srcObject=null;this.audio.remove();this.audio=null;}
 }
}
