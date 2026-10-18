
import {cases as base} from './cases.js';
import {extraCases} from './extra-cases.js';
import {naturalReply} from './conversation.js';
import {VoiceRoom} from './voice.js';
import {PatientSpeaker} from './speaker.js';
import {drawPatient} from './avatar.js';
import {wardScene} from './ward-scene.js';
import {observerSummaries,assessmentPayload} from './examiner.js';

const patients=[...base,...extraCases],$=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const API_KEY='paces-ward-voice-api';
let patientPosition='lying';
let api='',session=null,recognition=null,voice=null,token=0,cameraCanvas=null,cameraStream=null,cameraFrame=0,cameraVideo=null,sheet=null,videoCall=null,patientTalking=false,timer=null;
const speaker=new PatientSpeaker({onSpeaking:state=>{patientTalking=state;$('#bars')?.classList.toggle('active',state);},onStatus:announce});
try{api=localStorage.getItem(API_KEY)||'';}catch{}
function announce(s){const e=$('#liveStatus');if(e)e.textContent=s;}
function speak(text,voiceIndex=0,done=()=>{}){
 const n=token;
 // Voice 2 means current patient; consultants use contrasting adult voices.
 const person=voiceIndex===2?c():voiceIndex===1?{id:1,sex:'Man'}:{id:0,sex:'Woman'};
 speaker.speak(text,{patient:person,endpoint:voiceIndex===2?api:'',preferAI:voiceIndex===2&&!!api,
  done:()=>{if(n===token)done();}});
}
function stop(){
 token++;try{recognition?.abort();}catch{}recognition=null;
 voice?.stop();voice=null;speaker.stop();window.speechSynthesis?.cancel();patientTalking=false;
 if(videoCall&&api){
  fetch(api.replace(/\/+$/,'')+'/video/end',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:videoCall.id})}).catch(()=>{});
 }videoCall=null;
 if(cameraFrame)cancelAnimationFrame(cameraFrame);cameraFrame=0;
 cameraStream?.getTracks().forEach(t=>t.stop());cameraStream=null;cameraCanvas=null;cameraVideo=null;
}
function begin(mode,id=null){
 patientPosition='lying';stop();session={mode,ids:mode==='exam'?patients.map(c=>c.id):[Number(id)],index:0,stage:mode==='exam'?'intro':'patient',records:{},caseStart:Date.now()};
 render();
}
function c(){return session&&patients[session.ids[session.index]];}
function r(){const id=c().id;return session.records[id]??={messages:[],signs:[],notes:'',assessment:null};}
function info(){return observerSummaries(c(),r());}
function log(who,text){
 if(!session||session.stage!=='patient'||!text?.trim())return;
 const rec=r();if(rec.messages.at(-1)?.who===who&&rec.messages.at(-1)?.text===text)return;
 rec.messages.push({who,text});
 refresh();
}
function home(){
 $('#app').innerHTML=`<div class="container landing"><div class="eyebrow">MRCP PACES PRACTICE</div><h1>Step into the ward.<br><em>Speak with your patient.</em></h1><p class="muted">Meet fictional patients, have a spoken conversation and get feedback from two simulated consultants. No confusing dashboards or notes to complete.</p><div class="modes">
 <button class="mode primary" id="full"><span class="mini-icon">✦</span><span class="mode-title">Start Full Exam</span><span class="mode-desc">Meet both consultants, hear the guidelines, then practise with 10 patients in one circuit.</span><span class="mode-arrow">↗</span></button>
 <button class="mode" id="one"><span class="mini-icon">◎</span><span class="mode-title">Practise One Case</span><span class="mode-desc">Choose a patient and start speaking straight away. One encounter at a time.</span><span class="mode-arrow">↗</span></button></div>
 <p class="choice-note">Full extended practice · 10 fictional patients · 10 minutes each · two simulated consultant perspectives</p>
 <div class="case-picker hide" id="picker"><label for="choice">Select a patient</label><select id="choice">${patients.map((p,i)=>`<option value="${i}">Case ${i+1}: ${esc(p.title)} · ${esc(p.kind)}</option>`).join('')}</select><button class="btn btn-main btn-large" style="margin-top:15px;width:100%" id="launch">Start This Case →</button></div>
 <details class="settings"><summary>Optional Gemini patient conversation setup</summary><label for="endpoint">Secure service URL (not an API key)</label><input id="endpoint" type="url" placeholder="https://your-worker.workers.dev" value="${esc(api)}"><p class="help">The no-login demo works with expressive animated patient illustrations and gender-matched device voices. Mobile speech recognition varies by browser; typing always works. A protected speech service provides more natural AI voices when configured. For natural Gemini dialogue, deploy the secure Cloudflare Worker and set GEMINI_API_KEY as a secret. For genuine interactive patient video, the server also needs a Tavus API key and PAL configured.</p><button class="btn" id="saveEndpoint">Save URL</button></details>
 <p class="footnote">Independent educational simulation. The official PACES has eight encounters at five stations, assessed by two examiners per station. The ten-patient mode is additional training, not the official format. No real patient data.</p></div>`;
 $('#full').onclick=()=>begin('exam');$('#one').onclick=()=>{$('#picker').classList.toggle('hide');$('#picker').scrollIntoView({behavior:'smooth',block:'nearest'});};
 $('#launch').onclick=()=>begin('case',$('#choice').value);
 $('#saveEndpoint').onclick=()=>{const v=$('#endpoint').value.trim().replace(/\/+$/,'');if(v&&!/^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(v)&&!/^http:\/\/localhost(?::\d+)?$/i.test(v)){alert('Enter an HTTPS service URL, not a key.');return;}api=v;try{localStorage.setItem(API_KEY,v);}catch{}alert('Service URL saved on this device.');};
}
const briefing=[
 ['a','Good morning, doctor. I am Dr Sarah Morgan, your clinical examiner. Welcome to the PACES Ward simulation.'],
 ['b','Hello, I am Dr James Patel, observing communication and patient welfare. We will guide you through today’s practice circuit.'],
 ['a','You will see ten fictional patients in this extended training circuit. The official PACES format has eight patient encounters, so this circuit is additional practice.'],
 ['b','You have ten minutes per patient. Introduce yourself, obtain consent, ask relevant questions and explain your decisions clearly. You can use the Examine button when needed.'],
 ['a','We will observe and give educational feedback. There is no official pass or fail here. Speak naturally, listen carefully and treat each patient with respect.'],
 ['b','The first patient is ready. You can begin now. Good luck, doctor.']
];
function intro(){
 $('#app').innerHTML=`<div class="frame"><div class="sessionbar"><div><div class="eyebrow">THE EXAM BEGINS HERE</div><h2>Your two consultants are ready</h2><p class="muted">You can listen, ask a question or skip this introduction.</p></div><button class="btn" id="back">Exit</button></div>
 <div class="intro-area"><div class="eyebrow">WARD BRIEFING</div><h2>Good morning, doctor.</h2><div class="consultants">
 <div id="ca" class="consultant-card"><span class="consultant-head">SM</span><div><strong>Dr Sarah Morgan</strong><small>Clinical reasoning & examination</small></div></div>
 <div id="cb" class="consultant-card"><span class="consultant-head">JP</span><div><strong>Dr James Patel</strong><small>Communication & patient welfare</small></div></div></div>
 <p class="intro-quote" id="quote" aria-live="polite">The consultants will greet you.</p><div class="intro-actions"><button class="btn btn-main btn-large" id="skip">Skip & Meet First Patient →</button><button class="btn" id="repeat">↻ Hear Again</button><button class="btn" id="askMic">🎙 Ask Consultants</button></div>
 <form class="compose" id="askConsultant" style="max-width:680px;margin:18px auto 0"><input id="cq" placeholder="Or type a question about timing, marking, or the exam"><button class="btn" type="submit">Ask</button></form>
 <p class="floating-status" id="liveStatus">The audio briefing will play automatically.</p></div></div>`;
 $('#back').onclick=()=>{session=null;stop();render();};
 $('#skip').onclick=firstPatient;$('#repeat').onclick=playIntro;$('#askMic').onclick=hearIntro;
 $('#askConsultant').onsubmit=e=>{e.preventDefault();const q=$('#cq').value.trim();if(q)answerIntro(q);};
 playIntro();
}
function playIntro(){
 token++;speaker.stop();const n=token;let index=0;
 function next(){
  if(n!==token||session?.stage!=='intro')return;
  if(index===briefing.length){announce('Briefing complete. Starting your first patient.');$('#ca').classList.remove('active');$('#cb').classList.remove('active');setTimeout(()=>{if(n===token&&session?.stage==='intro')firstPatient();},900);return;}
  const [who,text]=briefing[index++];
  $('#ca').classList.toggle('active',who==='a');$('#cb').classList.toggle('active',who==='b');
  $('#quote').textContent='“'+text+'”';
  speak(text,who==='a'?0:1,()=>setTimeout(()=>{if(n===token)next();},250));
 }
 next();
}
function answerIntro(question){
 token++;speaker.stop();const q=question.toLowerCase();
 const answer=/tim|long|minute/.test(q)?'Each practice encounter lasts ten minutes, and you may move to the next patient early.':/mark|pass|score|assess/.test(q)?'Our observations are for learning and reflection, not an official PACES grade.':/start|begin|ready|first/.test(q)?'We are ready when you are. Select Skip and Meet First Patient to begin.':/real|official|format|eight|ten/.test(q)?'The official PACES has eight encounters; today’s optional extended training has ten fictional patients.':'Focus on consent, relevant clinical history, your working diagnosis and the patient’s concerns. You may begin when ready.';
 $('#ca').classList.add('active');$('#cb').classList.remove('active');$('#quote').textContent='Dr Sarah Morgan: “'+answer+'”';announce('Consultant answering.');speak(answer,0,()=>announce('Ask another question or start the first patient.'));
}
function hearIntro(){
 const R=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!R){announce('Voice input unavailable; type your question below.');return;}
 token++;speaker.stop();const rec=new R();recognition=rec;rec.lang='en-GB';
 rec.onresult=e=>{const q=e.results?.[0]?.[0]?.transcript||'';if(q){$('#cq').value=q;answerIntro(q);}};
 rec.onerror=e=>announce('Microphone error: '+e.error+'. You can type instead.');
 try{rec.start();announce('Listening to your question…');}catch{announce('Could not open microphone. Please type.');}
}
function firstPatient(){patientPosition='lying';stop();session.stage='patient';session.caseStart=Date.now();render();}
function header(p){return `<div class="sessionbar"><div><div class="eyebrow">${session.mode==='exam'?'EXTENDED TRAINING CIRCUIT':'SINGLE CASE PRACTICE'}</div><h2>${session.mode==='exam'?'Patient '+(session.index+1)+' of '+session.ids.length:'Your patient'} · ${esc(p.kind)}</h2><div class="sessionmeta">${esc(p.location)} · Two simulated consultants observing</div></div><div class="timer" id="countdown">10:00</div></div><div class="progress">${session.ids.map((_,i)=>`<span class="${i<session.index?'done':i===session.index?'current':''}"></span>`).join('')}</div>`;}
function setPatientPosition(position,{spoken=false}={}){
 if(!['lying','sitting','standing'].includes(position))return;
 patientPosition=position;
 const art=$('#wardArt');
 if(art){art.classList.remove('pose-lying','pose-sitting','pose-standing');art.classList.add('pose-'+position);art.setAttribute('aria-label',c().name+' '+(position==='lying'?'lying in bed':position==='sitting'?'sitting on the bed':'standing beside the bed'));}
 document.querySelectorAll('[data-pose]').forEach(btn=>{const active=btn.dataset.pose===position;btn.classList.toggle('is-active',active);btn.setAttribute('aria-pressed',String(active));});
 const labels={lying:'Patient lying down on the bed.',sitting:'Patient sitting upright on the bed.',standing:'Patient standing beside the bed.'};
 announce(labels[position]+(spoken?' Responding to your instruction.':''));
}
function positionInstruction(question){
 const q=String(question).toLowerCase();
 if(/(?:lie|lay)\s+(?:back\s+)?down|lie\s+back|lay\s+back|recline|back\s+on\s+(?:the\s+)?bed/.test(q))return {position:'lying',answer:'Of course, doctor. I’ll lie back down.'};
 if(/stand\s+(?:up|by|beside|next\s+to)|get\s+up\s+(?:off|from)\s+(?:the\s+)?bed/.test(q))return {position:'standing',answer:'All right, doctor. I’ll stand beside the bed.'};
 if(/sit\s+(?:up|upright|on\s+(?:the\s+)?(?:bed|edge))|come\s+up\s+to\s+sitting/.test(q))return {position:'sitting',answer:'Yes, doctor. I’ll sit up for you.'};
 return null;
}
function encounter(){
 const p=c(),v=r();if(!v.messages.length)v.messages.push({who:'patient',text:p.opening});
 $('#app').innerHTML=`<div class="frame ward-experience">${header(p)}<div class="call-layout"><section class="ward-primary">
 <div class="video-frame ward-video" id="videoFrame">
  <video id="patientVideo" class="hide" autoplay muted playsinline aria-label="Simulated patient video"></video>
  <div class="ward-scene" id="wardScene">${wardScene(p,patientPosition)}</div>
  <div class="video-top"><span class="video-tag"><span class="green-dot"></span><span id="videoMode">Hospital ward · illustrated simulation</span></span><span class="video-tag" id="micState">● Ready</span></div>
  <div class="video-nameplate"><span class="nameplate"><strong>${esc(p.name)}</strong><small>${esc(p.age)} years · ${esc(p.sex)} · Fictional patient</small></span><div id="bars" class="signal"><span></span><span></span><span></span><span></span></div></div>
 </div>
 <div class="ward-position-panel"><div class="position-label"><strong>Patient position</strong><small>Ask the patient to move, or select a position</small></div><div class="position-buttons"><button class="pose-button" data-pose="lying" aria-pressed="${patientPosition==='lying'}">▰ <span>Lie Down</span></button><button class="pose-button" data-pose="sitting" aria-pressed="${patientPosition==='sitting'}">♙ <span>Sit Up</span></button><button class="pose-button" data-pose="standing" aria-pressed="${patientPosition==='standing'}">♟ <span>Stand by Bed</span></button></div></div>
 <div class="call-actions"><button class="btn btn-main btn-large" id="talk">🎙 Start Talking</button><button class="btn" id="mute">Mute / Stop</button><button class="btn" id="examine">🩺 Examine</button><button class="btn" id="next">${session.index===session.ids.length-1?'Finish & Review →':'Next Patient →'}</button></div>
 <p class="floating-status" id="liveStatus" role="status">Your patient is ready. Use the microphone or type a question.</p>
 <form id="typeForm" class="compose"><input id="typed" aria-label="Type a patient question" placeholder="Type a question or ask the patient to sit or stand…"><button class="btn btn-main" type="submit">Ask →</button></form>
 </section>
 <aside class="patient-shell ward-sidebar"><div class="patient-info"><div class="eyebrow">CONSULTATION ROOM</div><h3>${esc(p.name)}</h3><p class="muted">Introduce yourself, ask questions and request a position for examination.</p><span class="status-pill"><span class="green-dot"></span> Patient ready</span><div class="ward-side-actions"><button class="btn" id="details">Candidate Instructions</button><button class="btn btn-ghost" id="end">End Session</button></div></div>
 <div id="observers" class="patient-side-panel"></div>
 <div class="transcript"><div>Consultation transcript <span class="muted">· saved for review</span></div><div class="transcript-scroll" id="transcript"></div></div></aside></div></div>
 <dialog id="examModal"><h3>Examine the patient</h3><p class="muted">Choose a manoeuvre to reveal the simulated clinical finding. Clicks cannot assess physical examination technique.</p><div id="signs" class="finding-list"></div><div class="modal-actions"><button class="btn btn-main" id="closeSigns">Return to patient</button></div></dialog>
 <dialog id="instructionsModal"><h3>Candidate instructions</h3><p>${esc(p.instruction)}</p><div class="modal-actions"><button class="btn btn-main" id="closeInstructions">Back to patient</button></div></dialog>`;
 $('#talk').onclick=connect;$('#mute').onclick=()=>{voice?.stop();speaker.stop();if(videoCall)disconnectVideo();announce('Microphone is off. Start Talking to reconnect.');$('#micState').textContent='● Muted';};
 $('#examine').onclick=()=>{drawSigns();$('#examModal').showModal();};
 $('#closeSigns').onclick=()=>$('#examModal').close();
 $('#details').onclick=()=>$('#instructionsModal').showModal();$('#closeInstructions').onclick=()=>$('#instructionsModal').close();
 $('#next').onclick=nextCase;$('#end').onclick=()=>{if(confirm('End this session and review your performance?'))finish();};
 $('#typeForm').onsubmit=e=>{e.preventDefault();askTyped();};
 document.querySelectorAll('[data-pose]').forEach(button=>button.onclick=()=>setPatientPosition(button.dataset.pose));
 setPatientPosition(patientPosition);refresh();tick();
}
function refresh(){
 if(session?.stage!=='patient')return;
 const tr=$('#transcript'),v=r();if(tr){tr.innerHTML=v.messages.map(m=>`<div class="line ${m.who}"><strong>${m.who==='you'?'You':esc(c().name)}</strong>${esc(m.text)}</div>`).join('');tr.scrollTop=tr.scrollHeight;}
 const cs=$('#observers');if(cs)cs.innerHTML='<div class="eyebrow">CONSULTANTS OBSERVING</div>'+info().map(o=>'<p style="font-size:12px"><strong>'+esc(o.name)+'</strong><br><span class="muted">'+esc(o.role)+'</span><br><span class="muted">'+esc(o.summary)+'</span></p>').join('')+'<p class="footnote">Educational observations only. These are not live human examiners.</p>';
}
async function typedReply(text){
 const action=positionInstruction(text);
 if(action){setPatientPosition(action.position,{spoken:true});return action.answer;}
 // The same context-aware case dialogue is used by microphone and keyboard.
 // Only the authored patient fact bank may supply clinical history.
 if(api){try{const response=await fetch(api.replace(/\/+$/,'')+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId:c().id,question:text,history:r().messages.slice(0,-1)})});const data=await response.json();if(response.ok&&data.answer)return data.answer;announce('Gemini unavailable; using case-based fallback.');}catch{announce('Gemini unavailable; using case-based fallback.');}}
 return naturalReply(c(),text,r().messages).text;
}
async function askTyped(){
 const input=$('#typed'),q=input.value.trim();if(!q)return;
 if(videoCall){announce('Live video mode listens inside the video call; speak there.');return;}
 input.value='';log('you',q);
 if(voice?.active&&voice.mode==='ai'){if(!voice.sendText(q))announce('AI connection is not ready. Reconnect or try again.');return;}
 announce('Patient is considering your question…');const answer=await typedReply(q);if(session?.stage!=='patient')return;log('patient',answer);
 if(voice?.active&&voice.mode==='browser'){
  voice.busy=true;
  try{voice.recognition?.abort();}catch{}
  speak(answer,2,()=>{if(voice?.active){voice.busy=false;voice.listen();}});
 }else speak(answer,2);
}
async function connect(){
 if(voice?.active||videoCall){announce('Microphone already active. Speak to your patient.');return;}
 const b=$('#talk');b.disabled=true;announce('Connecting your microphone…');
 try{
  if(api&&await connectVideo()){announce('Live video connected. Speak inside the video call.');return;}
  voice=new VoiceRoom({onStatus:announce,onCandidate:t=>log('you',t),onPatient:t=>log('patient',t),onSpeaking:state=>{patientTalking=state;$('#bars')?.classList.toggle('active',state);},speaker});
  await voice.connectBrowser(c(),typedReply);if(api)$('#videoMode').textContent='Hospital ward · Gemini dialogue';
  $('#micState').textContent='● Mic connected';announce(api?'Gemini patient dialogue connected through browser microphone.':'Browser microphone connected. Speak to your patient.');
 }catch(e){announce('Could not start voice: '+(e.message||'Unknown error')+'. You can type instead.');}
 finally{if($('#talk'))b.disabled=false;}
}
async function connectVideo(){
 if(!api)return false;
 let response,result;
 try{
  response=await fetch(api.replace(/\/+$/,'')+'/video/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId:c().id})});
  result=await response.json().catch(()=>({}));
 }catch{return false;}
 if(response.status===404||response.status===503&&result.code==='VIDEO_NOT_CONFIGURED')return false;
 if(!response.ok)throw Error(result.error||'Video service unavailable.');
 if(!result.conversation_url)throw Error('No video room returned.');
 const url=new URL(result.conversation_url);
 if(url.protocol!=='https:'||!/(^|\.)daily\.co$/.test(url.hostname))throw Error('Unexpected video room host.');
 stopPortrait();videoCall={id:result.conversation_id};
 const iframe=document.createElement('iframe');iframe.title='Live interactive AI patient video';iframe.src=url.href;iframe.allow='microphone; camera; autoplay; fullscreen';iframe.referrerPolicy='no-referrer';
 $('#videoFrame').prepend(iframe);$('#wardScene')?.classList.add('hide');$('#patientVideo')?.classList.add('hide');
 $('#videoMode').textContent='Live video patient · Tavus';$('#micState').textContent='● Video room connected';
 return true;
}
function disconnectVideo(){
 if(!videoCall)return;
 const id=videoCall.id;videoCall=null;$('#videoFrame iframe')?.remove();
 if(api)fetch(api.replace(/\/+$/,'')+'/video/end',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:id})}).catch(()=>{});
 $('#wardScene')?.classList.remove('hide');
}
function drawSigns(){
 const signs=$('#signs'),v=r(),p=c();
 signs.innerHTML=p.signs.length?p.signs.map(([act,result],i)=>`<button class="${v.signs.includes(i)?'done':''}" data-i="${i}">${v.signs.includes(i)?'✓ ':''}${esc(act)}${v.signs.includes(i)?'<span class="finding-result">'+esc(result)+'</span>':''}</button>`).join(''):'<p>This is a communication-only encounter.</p>';
 signs.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);if(!v.signs.includes(i))v.signs.push(i);drawSigns();refresh();});
}
function portrait(p){
 stopPortrait();
 // A directly-rendered canvas is more reliable on iPhone Safari than
 // video.captureStream(): no autoplay permission or silent black video.
 const cv=document.createElement('canvas');cv.id='patientVideo';
 cv.width=960;cv.height=650;cv.className='patient-avatar';
 cv.setAttribute('role','img');
 cv.setAttribute('aria-label','Animated illustration of '+p.name+' with speaking lips and blinking eyes');
 cameraCanvas=cv;
 const old=$('#patientVideo');if(!old)return;
 old.replaceWith(cv);
 const ctx=cv.getContext('2d');
 const start=performance.now();let previous=0;
 const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
 const render=time=>{
  if(cameraCanvas!==cv)return;
  if(time-previous>=40||previous===0){
   previous=time;
   drawPatient(ctx,p,(time-start)/1000,patientTalking,speaker.volume(),reduceMotion);
   $('#bars')?.classList.toggle('active',patientTalking);
  }
  cameraFrame=requestAnimationFrame(render);
 };
 cameraFrame=requestAnimationFrame(render);
}
function stopPortrait(){
 if(cameraFrame)cancelAnimationFrame(cameraFrame);cameraFrame=0;
 if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());
 cameraStream=null;cameraCanvas=null;
}
function tick(){
 if(session?.stage!=='patient')return;
 const left=600-(Date.now()-session.caseStart)/1000;
 const t=$('#countdown');if(t){t.textContent=String(Math.max(0,Math.floor(left/60))).padStart(2,'0')+':'+String(Math.max(0,Math.ceil(left)%60)).padStart(2,'0');t.classList.toggle('warn',left<60);}
 if(left<=0)nextCase();
}
async function assess(id){
 if(!api||!session)return;
 const v=session.records[id];if(!v||!v.messages.some(m=>m.who==='you')||v.assessment||v.assessmentPending||v.assessmentError)return;
 v.assessmentPending=true;
 try{
  const response=await fetch(api.replace(/\/+$/,'')+'/evaluate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(assessmentPayload(patients[id],v))});
  const data=await response.json();if(!response.ok||!Array.isArray(data.assessors))throw Error(data.error||'Unavailable');
  v.assessment=data.assessors;
 }catch(e){v.assessmentError=String(e.message||e);}
 finally{v.assessmentPending=false;if(session?.stage==='review')review();}
}
function nextCase(){
 if(session?.stage!=='patient')return;
 const id=c().id;assess(id);stop();
 if(session.index<session.ids.length-1){session.index++;patientPosition='lying';session.caseStart=Date.now();render();}else finish();
}
function finish(){
 if(!session)return;
 if(session.stage==='patient')assess(c().id);
 stop();session.stage='review';render();
}
function review(){
 const rows=session.ids.map(id=>({p:patients[id],rec:session.records[id]||{messages:[],signs:[]}}));
 $('#app').innerHTML=`<div class="review-area"><div class="eyebrow">SESSION FINISHED</div><h1>Practice complete.<br><em style="font-style:normal;color:#3de5bd">Reflect and improve.</em></h1><p class="muted">Your encounters are summarised below. Two simulated consultants provide evidence-based observations; when AI assessment is configured, additional comments appear here.</p>
 <div class="intro-actions" style="justify-content:flex-start"><button class="btn btn-main" id="again">Start Again</button><button class="btn" id="export">Download Session</button></div>
 <div class="case-results">${rows.map(({p,rec},i)=>`<details class="case-result" ${rows.length===1?'open':''}><summary>${i+1}. ${esc(p.name)} · ${esc(p.title)}<span>${rec.messages.filter(m=>m.who==='you').length} questions asked · ${rec.signs.length} exam actions</span></summary><p><strong>Working diagnosis / focus:</strong> ${esc(p.diagnosis)}</p>
 <div class="feedback-grid">${(rec.assessment?.length?rec.assessment.map(a=>({name:a.name,body:a.feedback})):observerSummaries(p,rec).map(a=>({name:a.name,body:a.summary+'. '+a.detail}))).map(a=>`<div class="feedback-card"><strong>${esc(a.name)}</strong>${esc(a.body)}</div>`).join('')}</div>
 ${rec.assessmentPending?'<p>AI consultant assessment loading…</p>':''}${rec.assessmentError?`<p>AI assessment unavailable: ${esc(rec.assessmentError)}</p>`:''}<h3 style="margin-top:22px">Conversation</h3>${rec.messages.map(m=>`<p><strong>${m.who==='you'?'Candidate':esc(p.name)}:</strong> ${esc(m.text)}</p>`).join('')}</details>`).join('')}</div><p class="footnote">Original fictional cases. The illustrated avatar's eyes and lips animate during simulated speech; it is not a recording of a person. Full interactive video requires a separate Tavus service and credentials. No result is an official PACES grade.</p></div>`;
 $('#again').onclick=()=>{stop();session=null;render();};
 $('#export').onclick=()=>{const blob=new Blob([JSON.stringify(session,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='paces-practice.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
}
function render(){if(!session)home();else if(session.stage==='intro')intro();else if(session.stage==='patient')encounter();else review();}
render();timer=setInterval(tick,500);
window.addEventListener('pagehide',stop);
